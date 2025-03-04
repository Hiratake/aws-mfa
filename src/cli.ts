#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'
import { description, name, version } from '../package.json'

const main = defineCommand({
  meta: { description, name, version },
  args: {},
  run: async ({ args }) => {
    consola.log(args)
  },
})

runMain(main)
