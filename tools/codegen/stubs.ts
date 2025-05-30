import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import keywords from '../../keywords.json';
import type { Keywords, Signature, Type } from './utilities/types';
import { simplifyArgName } from './utilities/utilities';

const CODEGEN_HEADER = `-- this file is auto-generated by codegen/stubs.ts
-- do not edit directly, edit the codegen script instead!
--# selene: allow(unscoped_variables, unused_variable, incorrect_standard_library_use)
`;

const TYPE_TO_STUB: Record<string, string> = {
	nil: 'nil',
	string: '""',
	integer: '0',
	number: '0',
	vector: 'vector.zero',
	quaternion: 'quaternion.identity',
	uuid: 'NULL_KEY',
	list: '{}',
	key: 'NULL_KEY',
};

function getStubValue(type: Type) {
	if (typeof type === 'string') {
		return getStubValueForType(type);
	}

	const types = Array.isArray(type) ? type : [];

	const typeStrings = types.map((type) =>
		typeof type === 'string' ? type : type.value,
	);

	for (const typeStr of typeStrings) {
		if (typeStr in TYPE_TO_STUB) {
			return TYPE_TO_STUB[typeStr];
		}
	}

	return 'nil';
}

function getStubValueForType(type: string) {
	return TYPE_TO_STUB[type] ?? 'nil';
}

function getLuauType(type: Type) {
	if (typeof type === 'string') {
		return type;
	}

	const types = Array.isArray(type) ? type : [];
	const typeStrings = types.map((type) =>
		typeof type === 'string' ? type : type.value,
	);

	return typeStrings[0] ?? 'any';
}

function generateStub(name: string, signature: Signature, stub: string) {
	const typedArgs = signature.args.map((arg) => {
		const simplified = simplifyArgName(arg.name);
		const type = getLuauType(arg.type);
		return `${simplified}: ${type}`;
	});
	return `${name} = function(${typedArgs.join(', ')})
	return ${stub}
end
`;
}

function processKeywords(keywords: Keywords) {
	const stubs: string[] = [CODEGEN_HEADER];

	for (const [name, prop] of Object.entries(keywords.global.props)) {
		if (prop.def === 'func' && prop.signatures) {
			const signature = prop.signatures[0];
			const returnType = signature.result[0].type;
			const stubValue = getStubValue(returnType);

			stubs.push(generateStub(name, signature, stubValue));
		}
	}

	for (const [tableName, table] of Object.entries(keywords.global.props)) {
		if (table.def === 'table' && table.props) {
			for (const [name, prop] of Object.entries(table.props)) {
				if (prop.def === 'func' && prop.signatures) {
					const signature = prop.signatures[0];
					const returnType = signature.result[0].type;
					const stubValue = getStubValue(returnType);

					stubs.push(
						generateStub(`${tableName}.${name}`, signature, stubValue),
					);
				}
			}
		}
	}

	return stubs.join('\n').concat('\n');
}

const stubs = processKeywords(keywords);
const outputPath = join(import.meta.dir, 'out', 'stubs.luau');

await writeFile(outputPath, stubs);

console.log('Generated stubs');
console.log([outputPath]);
