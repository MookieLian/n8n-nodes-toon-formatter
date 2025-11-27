# n8n-nodes-toon-formatter

This package ships a single community node for [n8n](https://n8n.io/) that converts JSON payloads into the compact [TOON format](https://toonformat.dev/docs). The node only surfaces the required `Input JSON` parameter and returns the formatted string under the `toon` key for every output item.

## Installation

1. Clone this repository (or install the package once it is published to npm).
2. Enable community nodes in your n8n instance.
3. Follow the [official community node guide](https://docs.n8n.io/integrations/community-nodes/installation/) to build and load the package into n8n.

## Operation

- **Format** – accepts any JSON value (object, array, primitive) and encodes it into TOON text.

## Usage

1. Add a **TOON Formatter** node to your workflow.
2. Provide data through the `Input JSON` field—either paste static JSON or reference previous nodes (for example `{{ $json }}`).
3. Run the workflow; the node outputs the formatted content in the `toon` property.

## Resources

- [TOON format documentation](https://toonformat.dev/docs)
- [n8n community nodes guide](https://docs.n8n.io/integrations/#community-nodes)

## Version history

- **0.1.0** – Initial release of the TOON formatter node.
