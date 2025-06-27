const { AisDecodeStream } = require('ais-stream-decoder');
const { Readable } = require('stream');

/**
 * Extracts the first !AIVDM message from a multi-line string.
 */
function getAISmessage(strData) {
  const messageList = strData.split('\n');  
  for (const message of messageList) {
    if (message.startsWith('!AIVDM')) {
      return message;
    }
  }
  return undefined;
}

/**
 * Extracts navigational status from a raw AIS NMEA sentence.
 * Returns null if message is not type 1–3 (Position Reports).
 *
 * @param {string} rawNMEASentence - Full !AIVDM sentence string.
 * @returns {number|null} Navigational status (0–15), or null if not applicable.
 */
function extractNavigationalStatus(rawNMEASentence) {  
  if(typeof rawNMEASentence != "string") return null;
  if (!rawNMEASentence.startsWith('!AIVDM')) return null;

  const fields = rawNMEASentence.split(',');

  // Basic validity check
  if (fields.length < 7) return null;

  const totalSentences = parseInt(fields[1], 10);
  const sentenceNumber = parseInt(fields[2], 10);
  const payload = fields[5];

  // Ignore multipart messages in MVP
  if (totalSentences > 1 || sentenceNumber > 1) return null;

  // Convert 6-bit ASCII payload to bit string
  const bitString = Array.from(payload).map(char => {
    const val = char.charCodeAt(0);
    const sixBit = val >= 48 && val <= 87 ? val - 48 : val - 56;
    return sixBit.toString(2).padStart(6, '0');
  }).join('');

  const messageType = parseInt(bitString.slice(0, 6), 2);
  if (![1, 2, 3].includes(messageType)) return null;

  const navStatus = parseInt(bitString.slice(38, 42), 2);
  return navStatus;
}


/**
 * Determines how often to poll based on AIS navigational status.
 * You can customize the time (in seconds) as needed.
 */
function determine_time_interval(AIS_status) {    
  switch (AIS_status) {
    case 0: // Under way using engine
      return 10;
    case 1: // At anchor
    case 5: // Moored
      return 120;
    case 3: // Restricted manoeuverability
      return 30;
    case 15: // Undefined
      return 60;
    default:
      return undefined;
  }
}


module.exports = {determine_time_interval, extractNavigationalStatus, getAISmessage};
