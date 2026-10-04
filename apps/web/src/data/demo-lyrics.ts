/**
 * Demo LRC lyrics for testing karaoke functionality
 * Format: [MM:SS.xx]Lyric text
 */

export const DEMO_LYRICS: Record<string, string> = {
  // "Have You Seen My Baby" - Demo song
  "demo-song-1": `[00:00.00]Have you seen my baby
[00:03.50]She's not a dame nor a lady
[00:07.20]Not in the way she walks, the way she talks
[00:11.00]Or the way she loves me
[00:14.50]Just look at me
[00:17.00]I'm like a monkey in a coconut tree
[00:20.80]I am overjoyed 'cause boy oh boy
[00:24.50]She's my gal
[00:27.50]
[00:28.00]She asks me when I say let's go out dancing
[00:32.00]Your place or mine don't waste my time with feaux romancing
[00:36.50]
[00:37.00]She's wild she's funny
[00:40.00]She doesn't care about clothes or money
[00:43.50]She just cares for me and she's all I need
[00:47.50]She's my gal
[00:50.50]
[00:51.00]She speaks too loud and laughs too hard she drinks too much
[00:55.00]Her manners and her language makes a grown man sweat and blush
[00:59.50]
[01:00.00]my honey bee
[01:02.50]Ain't nothing she wouldn't do for me
[01:06.00]She never plays it coy, She's a bundle of joy
[01:10.00]She is the one I love the one I'm dreaming of
[01:14.00]I am overjoyed 'cause boy oh boy
[01:18.00]She's my gal`,

  // Generic fallback when no LRC available
  "fallback": `[00:00.00]Lyrics loading...
[00:05.00]Waiting for song data
[00:10.00]Please wait while we sync
[00:15.00]the lyrics with the music`,
};

/**
 * Get LRC lyrics for a song ID
 * Falls back to demo lyrics if not found
 */
export function getLrcForSong(songId: string): string {
  return DEMO_LYRICS[songId] || DEMO_LYRICS["demo-song-1"];
}
