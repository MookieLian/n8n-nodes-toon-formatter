"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToonFormatter = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const INDENT = '  ';
const indent = (value, depth) => value
    .split('\n')
    .map((line) => (line.length ? `${INDENT.repeat(depth)}${line}` : line))
    .join('\n');
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const stringifyPrimitive = (value) => {
    if (value === null)
        return 'null';
    if (typeof value === 'string') {
        if (value.length === 0)
            return '""';
        return /[\s,]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? String(value) : `"${value}"`;
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    return '';
};
const normalizeJson = (value) => {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((entry) => normalizeJson(entry));
    }
    if (typeof value === 'object') {
        const normalized = {};
        for (const [key, entry] of Object.entries(value)) {
            normalized[key] = normalizeJson(entry);
        }
        return normalized;
    }
    throw new n8n_workflow_1.ApplicationError('Value must be valid JSON');
};
const formatValue = (value, label, depth) => {
    if (Array.isArray(value)) {
        return formatArray(value, label, depth);
    }
    if (isPlainObject(value)) {
        const header = label ? `${label}:` : 'object:';
        const entries = Object.entries(value);
        if (entries.length === 0) {
            return indent(`${header} {}`, depth);
        }
        const lines = [indent(header, depth)];
        for (const [childKey, childValue] of entries) {
            lines.push(formatValue(childValue, childKey, depth + 1));
        }
        return lines.join('\n');
    }
    if (label) {
        return indent(`${label}: ${stringifyPrimitive(value)}`, depth);
    }
    return indent(stringifyPrimitive(value), depth);
};
const formatArray = (value, label, depth) => {
    const keyLabel = label !== null && label !== void 0 ? label : 'items';
    if (value.length > 0 && value.every(isPlainObject)) {
        const fields = Array.from(value.reduce((set, entry) => {
            Object.keys(entry).forEach((key) => set.add(key));
            return set;
        }, new Set()));
        const header = `${keyLabel}[${value.length}]{${fields.join(',')}}:`;
        const lines = [indent(header, depth)];
        for (const entry of value) {
            const row = fields
                .map((field) => stringifyPrimitive(Object.prototype.hasOwnProperty.call(entry, field) ? entry[field] : null))
                .join(',');
            lines.push(indent(row, depth + 1));
        }
        return lines.join('\n');
    }
    const header = `${keyLabel}[${value.length}]:`;
    const lines = [indent(header, depth)];
    for (const entry of value) {
        if (Array.isArray(entry) || isPlainObject(entry)) {
            lines.push(formatValue(entry, undefined, depth + 1));
        }
        else {
            lines.push(indent(stringifyPrimitive(entry), depth + 1));
        }
    }
    return lines.join('\n');
};
const encodeToToon = (value) => {
    if (Array.isArray(value)) {
        return formatArray(value, undefined, 0);
    }
    if (isPlainObject(value)) {
        const sections = Object.entries(value).map(([key, entry]) => formatValue(entry, key, 0));
        return sections.filter(Boolean).join('\n\n').trim();
    }
    return formatValue(value, 'value', 0);
};
class ToonFormatter {
    constructor() {
        this.description = {
            displayName: 'TOON Formatter',
            name: 'toonFormatter',
            icon: { light: 'file:toonFormatter.svg', dark: 'file:toonFormatter.dark.svg' },
            group: ['transform'],
            version: 1,
            description: 'Formats any JSON payload into TOON text',
            defaults: {
                name: 'TOON Formatter',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            usableAsTool: true,
            properties: [
                {
                    displayName: 'Source',
                    name: 'sourceMode',
                    type: 'options',
                    options: [
                        {
                            name: 'Field Name',
                            value: 'fieldName',
                            description: 'Use a field from the incoming item that already contains JSON data',
                        },
                        {
                            name: 'Expression / Manual JSON',
                            value: 'expression',
                            description: 'Provide JSON directly or via an expression',
                        },
                    ],
                    default: 'fieldName',
                },
                {
                    displayName: 'Field Name',
                    name: 'fieldName',
                    type: 'string',
                    default: 'data',
                    description: 'Name of the field on the incoming item that holds the JSON data',
                    displayOptions: {
                        show: {
                            sourceMode: ['fieldName'],
                        },
                    },
                },
                {
                    displayName: 'JSON Value',
                    name: 'jsonValue',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    required: true,
                    default: '',
                    description: 'Paste JSON or use an expression to reference previous data',
                    noDataExpression: true,
                    displayOptions: {
                        show: {
                            sourceMode: ['expression'],
                        },
                    },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnItems = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const sourceMode = this.getNodeParameter('sourceMode', itemIndex);
                let rawValue;
                if (sourceMode === 'fieldName') {
                    const fieldName = this.getNodeParameter('fieldName', itemIndex);
                    rawValue = items[itemIndex].json[fieldName];
                }
                else {
                    rawValue = this.getNodeParameter('jsonValue', itemIndex);
                }
                if (rawValue === undefined) {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No JSON data found for the configured source', {
                        itemIndex,
                    });
                }
                let parsedInput = rawValue;
                if (typeof rawValue === 'string') {
                    const trimmed = rawValue.trim();
                    if (!trimmed) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'JSON input is empty', {
                            itemIndex,
                        });
                    }
                    try {
                        parsedInput = JSON.parse(trimmed);
                    }
                    catch {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Provided value is not valid JSON', {
                            itemIndex,
                        });
                    }
                }
                const jsonValue = normalizeJson(parsedInput);
                const toonPayload = encodeToToon(jsonValue);
                returnItems.push({
                    json: {
                        toon: toonPayload,
                    },
                    pairedItem: itemIndex,
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnItems.push({
                        json: {
                            toon: '',
                            error: error instanceof Error ? error.message : 'Unknown error',
                        },
                        pairedItem: itemIndex,
                        error,
                    });
                    continue;
                }
                if (error instanceof n8n_workflow_1.NodeOperationError) {
                    throw error;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                    itemIndex,
                });
            }
        }
        return [returnItems];
    }
}
exports.ToonFormatter = ToonFormatter;
//# sourceMappingURL=ToonFormatter.node.js.map