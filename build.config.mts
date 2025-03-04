// https://github.com/unjs/unbuild
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/cli'],
  externals: ['node:child_process'],
  declaration: true,
  rollup: { esbuild: { minify: true } },
})
