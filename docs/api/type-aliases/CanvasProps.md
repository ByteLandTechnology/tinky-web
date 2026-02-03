[**tinky-web**](../README.md)

---

[tinky-web](../README.md) / CanvasProps

# Type Alias: CanvasProps

> **CanvasProps** = `React.ComponentProps`\<_typeof_ `Box`\>

Props for the Canvas component

Extends all props from Tinky's Box component, allowing full customization
of the container's styling and layout properties.

## Remarks

While you can pass custom `width` and `height` props, the Canvas component
will override them with the current stdout dimensions. If you need a fixed-size
container, use a regular Box instead.
