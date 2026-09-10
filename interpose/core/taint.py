from __future__ import annotations

import json
from typing import Any, Iterable, Mapping, Sequence
from interpose.core.lattice import ProvenanceTag, TaintLevel


class TaintedStr(str):
    _tag: ProvenanceTag

    def __new__(
        cls,
        value: Any,
        tag: ProvenanceTag | TaintLevel | None = None,
        source: str = "direct",
    ) -> TaintedStr:
        raw_str = super().__new__(cls, "" if value is None else str(value))
        if isinstance(tag, ProvenanceTag):
            raw_str._tag = tag.copy_tag()
        elif isinstance(tag, TaintLevel):
            raw_str._tag = ProvenanceTag.create(tag, source=source)
        elif isinstance(value, TaintedStr):
            raw_str._tag = value.tag.copy_tag()
        else:
            raw_str._tag = ProvenanceTag.create(TaintLevel.USER_TRUSTED, source=source)
        return raw_str

    @property
    def tag(self) -> ProvenanceTag:
        return self._tag

    @property
    def level(self) -> TaintLevel:
        return self._tag.level

    def is_tainted(self, min_level: TaintLevel = TaintLevel.TOOL_UNTRUSTED_WEB) -> bool:
        return any(lvl >= min_level for lvl in self._tag.labels)

    def is_secret(self) -> bool:
        return TaintLevel.CRITICAL_SECRET in self._tag.labels

    def __add__(self, other: Any) -> TaintedStr:
        result_str = super().__add__(str(other))
        other_tag = other.tag if isinstance(other, TaintedStr) else None
        joined_tag = self._tag.join(other_tag).derive("concat")
        return TaintedStr(result_str, tag=joined_tag)

    def __radd__(self, other: Any) -> TaintedStr:
        result_str = str(other) + str(self)
        other_tag = other.tag if isinstance(other, TaintedStr) else None
        joined_tag = (other_tag.join(self._tag) if other_tag else self._tag).derive("rconcat")
        return TaintedStr(result_str, tag=joined_tag)

    def __getitem__(self, item: Any) -> TaintedStr:
        sub = super().__getitem__(item)
        trace_key = f"slice[{item.start if hasattr(item, 'start') else item}:{item.stop if hasattr(item, 'stop') else ''}]"
        return TaintedStr(sub, tag=self._tag.derive(trace_key))

    def lower(self) -> TaintedStr:
        return TaintedStr(super().lower(), tag=self._tag.derive("lower"))

    def upper(self) -> TaintedStr:
        return TaintedStr(super().upper(), tag=self._tag.derive("upper"))

    def strip(self, chars: str | None = None) -> TaintedStr:
        return TaintedStr(super().strip(chars), tag=self._tag.derive("strip"))

    def lstrip(self, chars: str | None = None) -> TaintedStr:
        return TaintedStr(super().lstrip(chars), tag=self._tag.derive("lstrip"))

    def rstrip(self, chars: str | None = None) -> TaintedStr:
        return TaintedStr(super().rstrip(chars), tag=self._tag.derive("rstrip"))

    def replace(self, old: str, new: str, count: int = -1) -> TaintedStr:
        replaced = super().replace(old, new, count)
        combined_tag = self._tag
        if isinstance(new, TaintedStr):
            combined_tag = combined_tag.join(new.tag)
        return TaintedStr(replaced, tag=combined_tag.derive(f"replace({old}->{new})"))

    def split(self, sep: str | None = None, maxsplit: int = -1) -> list[TaintedStr]:
        parts = super().split(sep, maxsplit)
        return [
            TaintedStr(part, tag=self._tag.derive(f"split[{idx}]"))
            for idx, part in enumerate(parts)
        ]

    def rsplit(self, sep: str | None = None, maxsplit: int = -1) -> list[TaintedStr]:
        parts = super().rsplit(sep, maxsplit)
        return [
            TaintedStr(part, tag=self._tag.derive(f"rsplit[{idx}]"))
            for idx, part in enumerate(parts)
        ]

    def splitlines(self, keepends: bool = False) -> list[TaintedStr]:
        parts = super().splitlines(keepends)
        return [
            TaintedStr(part, tag=self._tag.derive(f"line[{idx}]"))
            for idx, part in enumerate(parts)
        ]

    def join(self, iterable: Iterable[str]) -> TaintedStr:
        tag_acc = self._tag.copy_tag()
        items: list[str] = []
        for item in iterable:
            items.append(str(item))
            if isinstance(item, TaintedStr):
                tag_acc = tag_acc.join(item.tag)
        joined_str = super().join(items)
        return TaintedStr(joined_str, tag=tag_acc.derive("join"))

    def format(self, *args: Any, **kwargs: Any) -> TaintedStr:
        formatted_str = super().format(*args, **kwargs)
        tag_acc = self._tag.copy_tag()
        for a in args:
            if isinstance(a, TaintedStr):
                tag_acc = tag_acc.join(a.tag)
        for v in kwargs.values():
            if isinstance(v, TaintedStr):
                tag_acc = tag_acc.join(v.tag)
        return TaintedStr(formatted_str, tag=tag_acc.derive("format"))

    def __format__(self, format_spec: str) -> str:
        res = super().__format__(format_spec)
        return str(res)

    def declassify(self, reason: str) -> TaintedStr:
        return TaintedStr(str(self), tag=self._tag.declassify(reason))


def t_format(template: str | TaintedStr, *args: Any, **kwargs: Any) -> TaintedStr:
    # Formats a template while propagating taint from template and all substituted values
    base = TaintedStr(template) if not isinstance(template, TaintedStr) else template
    return base.format(*args, **kwargs)


def taint_payload(
    data: Any,
    tag: ProvenanceTag | TaintLevel,
    source: str = "external_payload",
) -> Any:
    # Deeply propagates taint tag through nested structures (dicts, lists, primitives)
    actual_tag = (
        tag if isinstance(tag, ProvenanceTag) else ProvenanceTag.create(tag, source=source)
    )

    if isinstance(data, str):
        return TaintedStr(data, tag=actual_tag)
    elif isinstance(data, Mapping):
        return {
            (TaintedStr(k, tag=actual_tag) if isinstance(k, str) else k): taint_payload(
                v, actual_tag, source
            )
            for k, v in data.items()
        }
    elif isinstance(data, (list, tuple, set)):
        items = [taint_payload(item, actual_tag, source) for item in data]
        if isinstance(data, tuple):
            return tuple(items)
        elif isinstance(data, set):
            return set(items)
        return items
    return data


def extract_taints(data: Any) -> set[TaintLevel]:
    # Recursively scans arguments or data structures for any embedded taint levels
    found: set[TaintLevel] = set()
    if isinstance(data, TaintedStr):
        found.update(data.tag.labels)
    elif isinstance(data, Mapping):
        for k, v in data.items():
            found.update(extract_taints(k))
            found.update(extract_taints(v))
    elif isinstance(data, (list, tuple, set)):
        for item in data:
            found.update(extract_taints(item))
    return found


def extract_provenance_tags(data: Any) -> list[ProvenanceTag]:
    tags: list[ProvenanceTag] = []
    if isinstance(data, TaintedStr):
        tags.append(data.tag)
    elif isinstance(data, Mapping):
        for k, v in data.items():
            tags.extend(extract_provenance_tags(k))
            tags.extend(extract_provenance_tags(v))
    elif isinstance(data, (list, tuple, set)):
        for item in data:
            tags.extend(extract_provenance_tags(item))
    return tags


def tainted_json_loads(
    json_text: str | TaintedStr,
    source: str = "json_deserializer",
) -> Any:
    parsed = json.loads(str(json_text))
    base_tag = (
        json_text.tag
        if isinstance(json_text, TaintedStr)
        else ProvenanceTag.create(TaintLevel.TOOL_UNTRUSTED_WEB, source=source)
    )
    return taint_payload(parsed, tag=base_tag, source=source)


def sanitize(data: Any, reason: str = "sanitized") -> Any:
    if isinstance(data, TaintedStr):
        return data.declassify(reason)
    elif isinstance(data, Mapping):
        return {k: sanitize(v, reason) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize(x, reason) for x in data]
    return data
