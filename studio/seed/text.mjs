export function blocks(lines) {
  return (lines || [])
    .filter((line) => typeof line === "string" && line.trim())
    .map((text, index) => ({
      _type: "block",
      _key: `b${index + 1}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `s${index + 1}`, text, marks: [] }],
    }));
}

export function slug(current) {
  return { _type: "slug", current };
}
