export const getTokenByKey = (key, cookies) => {
  let cookie = cookies.match(new RegExp('(^| )' + key + '=([^;]+)'));
  if (cookie) {
    return cookie[2];
  }
};
export const removeCookie = (key) => {
  document.cookie = key + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export const getUserToken = () => {
  let token = localStorage.getItem('token');
  return token;
};

export const getMastodonToken = () => {
  const userToken = 'ff2e428be10133abc5c4a0eeb5ca119e2d9a32c87e80a1853e67ba557e69694f';
  // const userToken = 'c2244c8e62d30bfb0ad2637ab4327e020fca14e7e7d5050b5ef90c4811348f0b';
  return userToken;
}

export const decode64 = (string) => {
  return atob(string);
}

export const encode64 = (string) => {
  // const Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/++[++^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

  return btoa(string);
}

export const decodePath = (string) => {
  const rawPath = decode64(string);
  const path = rawPath.split(':');
  return `p${path[1]}`;
}
export const decodeTrend = (string) => {
  return `trend${string}`;
}

export const decodePathStep = (pathId, stepId) => {
  const rawPath = decode64(pathId);
  const rawStep = decode64(stepId)
  const path = rawPath.split(':');
  const step = rawStep.split(':');
  return `p${path[1]}s${step[1]}`;
}

export const decodeTickerChat = (pathId, userId, tickerId, mentorId) => {
  const rawPath = decode64(pathId);
  const rawUser = decode64(userId);
  const rawTicker = decode64(tickerId);
  const rawMentor = decode64(mentorId);
  const path = rawPath.split(':');
  const user = rawUser.split(':');
  const ticker = rawTicker.split(':');
  const mentor = rawMentor.split(':');
  return `p${path[1]}u${user[1]}t${ticker[1]}m${mentor[1]}`;
}

export const decodeStickyChat = (pathId, stepId) => {
  const rawPath = decode64(pathId);
  const rawStep = decode64(stepId)
  const path = rawPath.split(':');
  const step = rawStep.split(':');
  return `p${path[1]}s${step[1]}_sticky`;
}

export const cleanTags = (chat, tags) => {
  if (tags.length > 0) {
    let newChat = chat;
    for (let m = 0; m < tags.length; m++) {
      const url = tags[m].url;
      const tag = tags[m].name;
      newChat = newChat.replace(`<a href="${url}" class="mention hashtag" rel="tag">#<span>${tag}</span></a>`, `#${tag}`);
    }
    return newChat;
  } else {
    return chat;
  }
}

export const cleanAllTags = (chat, tags) => {
  if (tags.length > 0) {
    let newChat = chat;
    for (let m = 0; m < tags.length; m++) {
      const url = tags[m].url;
      const tag = tags[m].name;
      newChat = newChat.replace(`<a href="${url}" class="mention hashtag" rel="tag">#<span>${tag}</span></a>`, '');
    }
    return newChat;
  } else {
    return chat;
  }
}

export const cleanMentions = (chat, mentions) => {
  if (mentions.length > 0) {
    let newChat = chat;
    for (let m = 0; m < mentions.length; m++) {
      const url = mentions[m].url;
      const username = mentions[m].username;
      const stringUrl = `<a href="${url}" class="u-url mention">@<span>${username}</span></a>`;
      newChat = newChat.replace(stringUrl, `@${username}`);
    }
    return newChat;
  } else {
    return chat;
  }
}

export const cleanMentionPrivate = (chat, mentions) => {
  if (mentions.length > 0) {
    let newChat = chat;
    const match = newChat.match(`<span class="h-card">@${mentions[0].username}</span> `);
    if (match) {
      const stringUrl = match[0];
      newChat = newChat.replace(stringUrl, '');
    }
    return newChat;
  } else {
    return chat;
  }
}

export const cleanChats = (chat, tags, mentions) => {
  let newChat = chat;
  if (tags.length > 0) {
    newChat = cleanTags(newChat, tags);
  }
  if (mentions.length > 0) {
    newChat = cleanMentions(newChat, mentions);
  }
  return newChat;
}

export const cleanAllChats = (chat, tags, mentions) => {
  let newChat = chat;
  if (tags.length > 0) {
    newChat = cleanAllTags(newChat, tags);
  }
  if (mentions.length > 0) {
    newChat = cleanMentions(newChat, mentions);
  }
  return newChat;
}

export const getObject = (path, object) => {
  return path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, object);
};

export const convertTimestamp = (timestamp) => {
  const shortMonth = ["Jan", "Feb", "Mar", "Apr", "Mar", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Des"];
  const date = new Date(timestamp * 1000);
  const dateText = `${date.getDate()} ${shortMonth[date.getMonth()]} ${date.getFullYear()}`;
  return dateText;
};

export const parseThousands = (number) => {
  if (typeof (number) === 'number') {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  } else {
    return number;
  }
};

export const shortenString = (text, length) => {
  const textLength = length && length > 0 ? length : 120;
  if (text.length <= textLength) {
    return text
  } else {
    let result = text.substring(0, textLength)
    return result.substring(0, result.lastIndexOf(' ')) + '...'
  }
};

export const checkEmail = (email) => {
  return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email));
};

export const maskEmail = (email) => {
  if (email && email !== "") {
    let result = ''
    result = result + email.substring(0, 1)
    for (var i = 1; i < email.indexOf('@') - 1; i++) {
      if (/^[A-Za-z0-9]+$/i.test(email[i]) === true) {
        result = result + '*'
      } else {
        result = result + email[i]
      }
    }
    result = result + email.substring(email.indexOf('@') - 1, email.indexOf('@')) + email.substring(email.indexOf('@'), email.length)
    return result
  }
  return
}