---
name: vision-mcp
description: Use when the task includes screenshots, images, or visual documents and the current model lacks native vision.
origin: DevZeros
---

# Vision MCP

Use `devzeros-vision` only when a task requires image understanding and the active model cannot read images directly.

## Conditional Activation Rule

Check whether the active model supports vision natively before deciding which path to use.

**Models WITH native vision - do NOT use this MCP:**
- Any `claude-*` model (Claude Sonnet, Haiku, Opus, etc.)
- Any `gemini-*` model (Gemini Flash, Pro, Ultra, etc.)
- `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-4-vision-preview`, `gpt-5`
- `opencode-zen/claude-sonnet-4`, `opencode-zen/claude-haiku-3.5`
- `opencode-zen/gemini-3-flash`, `opencode-zen/mimo-v2-omni-free`
- `openrouter/google/gemma-3-27b-it:free`, `openrouter/google/gemma-3-4b-it:free`

**Models WITHOUT native vision - use `analyze_chat_image` automatically when an image is attached:**
- `opencode-go/glm-5`, `opencode-zen/glm-5`
- `opencode-go/kimi-k2.5`
- `opencode-go/minimax-m2.7`, `opencode-go/minimax-m2.5`
- Any other model not listed above

## Mandatory Routing Rule

- If the active model can read the image directly, stay on the native path and do not call any `devzeros-vision` tool.
- If the active model cannot read the image directly, use `devzeros-vision` as the fallback path.
- If the user attached an image and the active model has no native vision, call `analyze_chat_image` before replying with any "I cannot analyze images" message.
- If a caller still invokes this MCP while using a native-vision model and provides the active model id, the MCP should reject the call.

## When To Use

- UI screenshot review
- Diagram or chart analysis
- OCR-style extraction from image files
- Comparing two or more screenshots
- Any image attachment when the active model cannot process images natively

## Tools

- `analyze_chat_image` - use when the user attaches an image and the active model has no native vision; fetches the attachment automatically, no filename needed
- `analyze_image` - use when you already know the file path or URL of the image
- `analyze_images` - use when you need to analyze multiple images at once
- `list_providers` - list configured vision providers
- `list_models` - list available models for a provider

## Default Workflow

### When the active model has native vision and the user attaches an image

1. Analyze the image directly in chat with the current model.
2. Do not call `analyze_chat_image`, `analyze_image`, or `analyze_images`.
3. Answer the user normally from the native multimodal path.

### When the active model has no native vision and the user attaches an image

1. Call `analyze_chat_image` immediately with the user's question as the prompt.
2. Do not answer that the model cannot analyze images until this tool has been attempted.
3. Return the analysis; do not echo raw binary payloads.

### When you know the image path or URL

1. Choose `analyze_image` for one image or `analyze_images` for multiple.
2. Pass the user's actual request as the prompt.
3. Return the analysis result clearly and do not echo raw image payloads into chat.

### When analysis fails

1. If `analyze_chat_image` returns "No image attachment found", check:
   - Is `OPENCODE_DB_PATH` pointing to the correct file and accessible?
   - Was the image actually attached to a chat message (not just mentioned)?
2. As a fallback, ask the user for the absolute file path and use `analyze_image` directly.
3. If the MCP returns `NATIVE_VISION_MODEL`, stop using `devzeros-vision` and analyze the image directly with the active model.

## Provider Notes

- Default provider: `opencode-go`
- Provider priority when no provider is specified: `opencode-go`, `opencode-zen`, `openrouter`
- Model cascade per provider should prefer image-capable candidates and continue automatically on failure
- Use free image-capable models where the provider exposes them explicitly
- Use `list_models` if a requested model is unavailable

## Common Errors

- `provider not configured`
  Check the required API key environment variables.
- `model not found`
  Query `list_models` and retry with a valid model id.
- `file not found`
  Confirm the local path or URL is correct.

## Required Environment

The MCP expects these variables to be configured in the OpenCode environment:

- `OPENCODE_GO_API_KEY`
- `OPENCODE_ZEN_API_KEY`
- `OPENROUTER_API_KEY`
- `DEFAULT_PROVIDER`
- `OPENCODE_DB_PATH` (recommended - path to `opencode.db`; defaults to OS home-relative path)
- `OPENCODE_ATTACHMENTS_DIR` (optional fallback for desktop CLI)
- `OPENCODE_LOCAL_URL` (optional HTTP API fallback, defaults to `http://127.0.0.1:4096`)

## Rules

- Prefer one well-targeted prompt over repeated vague calls.
- Batch related images with `analyze_images` when comparison is needed.
- If the tool fails, report the failure instead of inventing image details.
