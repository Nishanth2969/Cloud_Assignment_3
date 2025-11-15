# Amazon Lex Bot Setup Instructions

## Bot Configuration

**Bot Name:** PhotoSearchBot  
**Language:** English (US)  
**Output Voice:** None (text only)  
**Session Timeout:** 5 minutes

## Intent Configuration

### SearchIntent

**Purpose:** Extract keywords from natural language photo search queries

#### Slots

1. **KeywordOne**
   - Slot Type: AMAZON.AlphaNumeric or Custom Slot Type
   - Prompt: Not required (optional slot)
   - Description: First search keyword

2. **KeywordTwo**
   - Slot Type: AMAZON.AlphaNumeric or Custom Slot Type
   - Prompt: Not required (optional slot)
   - Description: Second search keyword

#### Sample Utterances

Add all utterances from the `utterances.txt` file. Key patterns include:

- Single keywords: `{KeywordOne}`
- Show me pattern: `show me {KeywordOne}`
- Two keywords: `{KeywordOne} and {KeywordTwo}`
- Complex pattern: `show me photos with {KeywordOne} and {KeywordTwo}`

#### Slot Configuration Examples

```
{KeywordOne}
show me {KeywordOne}
find {KeywordOne}
{KeywordOne} and {KeywordTwo}
show me {KeywordOne} and {KeywordTwo}
show me photos with {KeywordOne}
show me photos with {KeywordOne} and {KeywordTwo}
find photos with {KeywordOne}
find photos of {KeywordOne} and {KeywordTwo}
photos with {KeywordOne} and {KeywordTwo}
pictures of {KeywordOne}
pictures of {KeywordOne} and {KeywordTwo}
I want to see {KeywordOne}
looking for {KeywordOne}
can you show me {KeywordOne}
```

## Fulfillment

**Type:** Lambda Function  
**Lambda Function:** search-photos (LF2)  
**Version/Alias:** Latest or specific version

## Response Configuration

The bot should return the extracted slots to the Lambda function without requiring confirmation.

**Confirmation Prompt:** Disabled  
**Closing Response:** Disabled (handled by Lambda)

## Testing Commands

Use these test phrases to verify bot configuration:

```
trees
show me dogs
find cats and birds
show me photos with mountains
I want to see people and cars
```

Expected behavior: Bot should extract keywords and pass them to the search Lambda function.

## Integration Notes

- The bot should be invoked by the search-photos Lambda function (LF2)
- Bot ID and Alias ID must be configured in the Lambda environment variables
- Use Lex V2 API for invocation (recognize_text)
- Session ID can be static or user-specific for production use

