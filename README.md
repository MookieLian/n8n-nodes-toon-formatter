# n8n-nodes-toon-formatter

A single community node for [n8n](https://n8n.io/) that converts JSON payloads into the compact [TOON format](https://toonformat.dev/docs). The node emits the formatted text under the `toon` key on each output item.

## Installation

1. Clone this repository (or install the package once it is published to npm).
2. Enable community nodes in your n8n instance.
3. Follow the [official community node guide](https://docs.n8n.io/integrations/community-nodes/installation/) to build and load the package into n8n.

## Operation

- **Format** – accepts any JSON value (object, array, primitive) and encodes it into TOON text.

## Usage

The node offers two ways to pick the JSON to encode:

- **Field Name** – read JSON directly from a field on the incoming item (for example `data`).
- **Expression / Manual JSON** – provide JSON via an expression or paste raw JSON.

Typical flows:

1. Add a **TOON Formatter** node to your workflow.
2. Choose **Source**:
   - **Field Name** – set **Field Name** (e.g. `data`); the node will use `item.json.data` as input.
   - **Expression / Manual JSON** – set **JSON Value**, for example:
     - `={{ $json }}` to encode the whole item
     - `={{ $json.data }}` to encode a nested property
3. Run the workflow and read the TOON output from the `toon` property.

## Resources

- [TOON format documentation](https://toonformat.dev/docs)
- [n8n community nodes guide](https://docs.n8n.io/integrations/#community-nodes)

## Version history

- **2.0.0** – Dual-source input (field name vs expression/manual JSON), improved encoder, updated icons and docs.
- **0.1.0** – Initial release of the TOON formatter node.
