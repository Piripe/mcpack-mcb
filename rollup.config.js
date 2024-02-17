export default {
	input: './cache/mod.js',
	output: {
		format: 'cjs',
		file: 'dst/mcpack.js',
		outro: 'module.exports = Object.assign({}, module.exports, exports)'
	},
	plugins: [],
}