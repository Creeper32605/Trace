# ContainerNode
##### _Extends TransformableNode_
This is a container node with no appearance of it's own. It acts as a holder for other objects and applies it's transform to them.

## Properties
##### _See TransformableNode: Properties_
### `items`
##### _Array[ObjectNode]_
The items contained.

## Methods
##### _See TransformableNode: Methods_
### `addItem(item)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| item     | ObjectNode | An item that will be added |

Adds an item to the container.

### `removeItem(item)`
| Argument | Type | Description |
| -------- | ---- | ----------- |
| item     | ObjectNode | The item to be removed |

Removes the item from the container.

### `draw(ctx, t, parent)`
##### _See TransformableNode: draw(ctx, t)_
| Argument | Type | Description |
| -------- | ---- | ----------- |
| ctx      | CanvasRenderingContext2D | A canvas |
| t        | Number | Time |
| parent   | Any | The parent node (used for positioning contained items) |

Draws the ContainerNode and all contained items on the canvas.