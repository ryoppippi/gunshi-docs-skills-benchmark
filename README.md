# Benchmark: Using `@gunshi/docs` with Claude Skills

## Background

We introduce `@gunshi/docs`, which includes documentation for Gunshi. It helps coding agents to use Gunshi more easily.
Because Gunshi is relatively new, LLM models may not have sufficient knowledge about it.
Previously, coding agents searched the web for Gunshi-related information, which was time-consuming and costly.
With `@gunshi/docs`, coding agents can quickly access Gunshi documentation by searching documents on the local machine, which doesn't require internet access and is more efficient.
Additionally, the CLI provides Claude skills, which makes it easier for Claude to use Gunshi (and Cursor rules as well)!

## Demo

test tool
- claude code 2.0.60 with opus4.5

### With Skills

- 0.44 USD
- 40s for implementation
- 1:05 for implementation + debugging

https://github.com/user-attachments/assets/06301c92-1305-4817-a042-7cb675112865

### Without Skills

- 1.37 USD
- 3:31 for implementation
- 3:52 for implementation + debugging

https://github.com/user-attachments/assets/a195e53c-a546-4b6b-b6a3-fbbd0a6e5f2c

## Miscellaneous

Although MCPs like Context7 and DeepWiki MCP can make it easier to extract relevant information from Gunshi's repository, they still take time to fetch data online.


## Related

- [pr for @gunshi/docs](https://github.com/kazupon/gunshi/pull/422)
- [gunshi's docs](https://gunshi.dev/guide/introduction/setup#llm-assisted-development)

