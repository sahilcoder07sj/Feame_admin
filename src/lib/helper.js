import { DateTime } from "luxon";

function getValidKeysString(obj, separator) {
    const keys = Object.keys(obj).filter(key => obj[key]);
    return keys.join(separator);
}

function removeNull(obj) {

    if (obj && typeof obj == "object") {
        return Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => value && value !== undefined && value !== null)
        );
    } else {
        return {}
    }

}
const toNumArray = (stringArray) => {
    const numberArray = stringArray.map(str => parseInt(str, 10));
    return numberArray;
}
function convertArrayToString(array) {
    return array.join(',');
}

function extractUserIds(userArray) {
    return userArray.map(user => user.user_id);
}

// function convertLocalTimeToUTC(localTime) {
//     if (localTime && localTime != null) {
//         const [hours, minutes, seconds = '00'] = localTime.split(':');
//         const now = new Date();
//         now.setHours(hours);
//         now.setMinutes(minutes);
//         now.setSeconds(seconds);
//         const utcHours = now.getUTCHours().toString().padStart(2, '0');
//         const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
//         const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
//         return `${utcHours}:${utcMinutes}:${utcSeconds}`;
//     } else {
//         return ""
//     }
// }
// function convertLocalTimeToUTC(localTime, localDate) {
//     if (!localDate || !localTime) {
//         return { utcDate: "", utcTime: "" };
//     }

//     const [hours, minutes, seconds = '00'] = localTime.split(':');

//     // Validate time input (basic validation for hours, minutes, seconds)
//     if (
//         isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
//         hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59
//     ) {
//         throw new Error("Invalid time format.");
//     }

//     const [year, month, day] = localDate.split('-');  // Assuming localDate is in 'YYYY-MM-DD' format

//     // Create a new Date object using the date and time
//     const dateObj = new Date(year, month - 1, day, hours, minutes, seconds);

//     // Convert to UTC
//     const utcYear = dateObj.getUTCFullYear();
//     const utcMonth = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
//     const utcDay = dateObj.getUTCDate().toString().padStart(2, '0');
//     const utcHours = dateObj.getUTCHours().toString().padStart(2, '0');
//     const utcMinutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
//     const utcSeconds = dateObj.getUTCSeconds().toString().padStart(2, '0');

//     const utcDate = `${utcYear}-${utcMonth}-${utcDay}`;
//     const utcTime = `${utcHours}:${utcMinutes}:${utcSeconds}`;

//     return { utcDate, utcTime };
// }


function convertLocalTimeToUTC(localTime, localDate, timeZone) {
    console.log(localTime, localDate, timeZone)
    if (!localDate || !localTime || !timeZone) {
        return { utcDate: "", utcTime: "" };
    }

    // Validate date input (basic validation for YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(localDate)) {
        throw new Error("Invalid date format. Expected format: YYYY-MM-DD.");
    }

    // Check if localTime includes seconds or not
    const timeFormat = localTime.split(':').length === 2 ? 'HH:mm' : 'HH:mm:ss';

    // Combine date and time into a single string
    const localDateTimeString = `${localDate}T${localTime}`;

    // Use Luxon to parse the local date and time with the specified time zone
    const localDateTime = DateTime.fromFormat(localDateTimeString, `yyyy-MM-dd'T'${timeFormat}`, { zone: timeZone });

    // Convert to UTC
    const utcDateTime = localDateTime.toUTC();

    // Format UTC date and time
    const utcDate = utcDateTime.toFormat('yyyy-MM-dd');
    const utcTime = utcDateTime.toFormat('HH:mm:ss');
    console.log(utcDate,utcTime)
    return { utcDate, utcTime };
}

// function convertUTCToLocalTime(utcTime) {
//     if (utcTime && utcTime != null) {
//         const [hours, minutes, seconds = '00'] = utcTime.split(':');
//         const now = new Date();
//         now.setUTCHours(hours);
//         now.setUTCMinutes(minutes);
//         now.setUTCSeconds(seconds);
//         const localHours = now.getHours().toString().padStart(2, '0');
//         const localMinutes = now.getMinutes().toString().padStart(2, '0');
//         const localSeconds = now.getSeconds().toString().padStart(2, '0');
//         return `${localHours}:${localMinutes}:${localSeconds}`;
//     } else {
//         return null;
//     }

// }

// function convertUTCToLocalTime(utcTime, utcDate) {
//     if (!utcDate || !utcTime) {
//         return { localDate: "", localTime: "" };
//     }

//     const [hours, minutes, seconds = '00'] = utcTime.split(':');
//     const [year, month, day] = utcDate.split('-');  // Assuming utcDate is in 'YYYY-MM-DD' format

//     // Create a Date object using the UTC date and time
//     const dateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

//     // Convert UTC to local
//     const localYear = dateObj.getFullYear();
//     const localMonth = (dateObj.getMonth() + 1).toString().padStart(2, '0');
//     const localDay = dateObj.getDate().toString().padStart(2, '0');
//     const localHours = dateObj.getHours().toString().padStart(2, '0');
//     const localMinutes = dateObj.getMinutes().toString().padStart(2, '0');
//     const localSeconds = dateObj.getSeconds().toString().padStart(2, '0');

//     const localDate = `${localYear}-${localMonth}-${localDay}`;
//     const localTime = `${localHours}:${localMinutes}:${localSeconds}`;

//     return { localDate, localTime };
// }

function convertUTCToLocalTime(utcTime, utcDate, timeZone) {
   
    if (!utcDate || !utcTime || !timeZone) {
        return { localDate: "", localTime: "" };
    }

    // Validate date input (basic validation for YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(utcDate)) {
        throw new Error("Invalid date format. Expected format: YYYY-MM-DD.");
    }

    // Check if utcTime includes seconds or not
    const timeFormat = utcTime.split(':').length === 2 ? 'HH:mm' : 'HH:mm:ss';

    // Combine date and time into a single string
    const utcDateTimeString = `${utcDate}T${utcTime}`;

    // Use Luxon to parse the UTC date and time
    const utcDateTime = DateTime.fromFormat(utcDateTimeString, `yyyy-MM-dd'T'${timeFormat}`, { zone: 'UTC' });

    // Convert to the specified time zone
    const localDateTime = utcDateTime.setZone(timeZone);

    // Format local date and time
    const localDate = localDateTime.toFormat('yyyy-MM-dd');
    const localTime = localDateTime.toFormat('HH:mm:ss');

    return { localDate, localTime };
}

function formatDateTime(dateString) {
    if (dateString) {
        const date = new Date(dateString);

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = String(date.getUTCFullYear());

        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    } else {
        return null
    }

}

function removeAtSymbol(str) {
    if (str) {
        if (str.startsWith('@')) {
            return str.slice(1);
        }

        return str;
    } else {
        return null
    }
}
function convertToCommaSeparatedString(data) {
    return data.map(item => item.text).join(',');
}
function convertToArray(commaSeparatedString) {
    if (!commaSeparatedString) {
        return [];
    }
    const emails = commaSeparatedString.includes(',') ? commaSeparatedString.split(',') : [commaSeparatedString];
    return emails.map(email => ({
        id: Math.floor(Math.random() * 10000000000).toString(),
        text: email.trim()
    }));
}
function getTrueKeys(obj) {
    return Object.keys(obj).filter(key => obj[key] === true);
  }
export { getValidKeysString, removeNull, toNumArray, convertArrayToString, extractUserIds, convertLocalTimeToUTC, convertUTCToLocalTime, formatDateTime, removeAtSymbol, convertToCommaSeparatedString, convertToArray ,getTrueKeys }