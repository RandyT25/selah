export interface BookInfo {
  number: number;
  name: string;
  abbreviation: string;
  testament: "OT" | "NT";
  genre: string;
  chapters: number;
}

export const BIBLE_BOOKS: BookInfo[] = [
  { number: 1, name: "Genesis", abbreviation: "Gen", testament: "OT", genre: "Law", chapters: 50 },
  { number: 2, name: "Exodus", abbreviation: "Exod", testament: "OT", genre: "Law", chapters: 40 },
  { number: 3, name: "Leviticus", abbreviation: "Lev", testament: "OT", genre: "Law", chapters: 27 },
  { number: 4, name: "Numbers", abbreviation: "Num", testament: "OT", genre: "Law", chapters: 36 },
  { number: 5, name: "Deuteronomy", abbreviation: "Deut", testament: "OT", genre: "Law", chapters: 34 },
  { number: 6, name: "Joshua", abbreviation: "Josh", testament: "OT", genre: "History", chapters: 24 },
  { number: 7, name: "Judges", abbreviation: "Judg", testament: "OT", genre: "History", chapters: 21 },
  { number: 8, name: "Ruth", abbreviation: "Ruth", testament: "OT", genre: "History", chapters: 4 },
  { number: 9, name: "1 Samuel", abbreviation: "1Sam", testament: "OT", genre: "History", chapters: 31 },
  { number: 10, name: "2 Samuel", abbreviation: "2Sam", testament: "OT", genre: "History", chapters: 24 },
  { number: 11, name: "1 Kings", abbreviation: "1Kgs", testament: "OT", genre: "History", chapters: 22 },
  { number: 12, name: "2 Kings", abbreviation: "2Kgs", testament: "OT", genre: "History", chapters: 25 },
  { number: 13, name: "1 Chronicles", abbreviation: "1Chr", testament: "OT", genre: "History", chapters: 29 },
  { number: 14, name: "2 Chronicles", abbreviation: "2Chr", testament: "OT", genre: "History", chapters: 36 },
  { number: 15, name: "Ezra", abbreviation: "Ezra", testament: "OT", genre: "History", chapters: 10 },
  { number: 16, name: "Nehemiah", abbreviation: "Neh", testament: "OT", genre: "History", chapters: 13 },
  { number: 17, name: "Esther", abbreviation: "Esth", testament: "OT", genre: "History", chapters: 10 },
  { number: 18, name: "Job", abbreviation: "Job", testament: "OT", genre: "Wisdom", chapters: 42 },
  { number: 19, name: "Psalms", abbreviation: "Ps", testament: "OT", genre: "Poetry", chapters: 150 },
  { number: 20, name: "Proverbs", abbreviation: "Prov", testament: "OT", genre: "Wisdom", chapters: 31 },
  { number: 21, name: "Ecclesiastes", abbreviation: "Eccl", testament: "OT", genre: "Wisdom", chapters: 12 },
  { number: 22, name: "Song of Solomon", abbreviation: "Song", testament: "OT", genre: "Poetry", chapters: 8 },
  { number: 23, name: "Isaiah", abbreviation: "Isa", testament: "OT", genre: "Prophecy", chapters: 66 },
  { number: 24, name: "Jeremiah", abbreviation: "Jer", testament: "OT", genre: "Prophecy", chapters: 52 },
  { number: 25, name: "Lamentations", abbreviation: "Lam", testament: "OT", genre: "Poetry", chapters: 5 },
  { number: 26, name: "Ezekiel", abbreviation: "Ezek", testament: "OT", genre: "Prophecy", chapters: 48 },
  { number: 27, name: "Daniel", abbreviation: "Dan", testament: "OT", genre: "Prophecy", chapters: 12 },
  { number: 28, name: "Hosea", abbreviation: "Hos", testament: "OT", genre: "Prophecy", chapters: 14 },
  { number: 29, name: "Joel", abbreviation: "Joel", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 30, name: "Amos", abbreviation: "Amos", testament: "OT", genre: "Prophecy", chapters: 9 },
  { number: 31, name: "Obadiah", abbreviation: "Obad", testament: "OT", genre: "Prophecy", chapters: 1 },
  { number: 32, name: "Jonah", abbreviation: "Jonah", testament: "OT", genre: "Prophecy", chapters: 4 },
  { number: 33, name: "Micah", abbreviation: "Mic", testament: "OT", genre: "Prophecy", chapters: 7 },
  { number: 34, name: "Nahum", abbreviation: "Nah", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 35, name: "Habakkuk", abbreviation: "Hab", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 36, name: "Zephaniah", abbreviation: "Zeph", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 37, name: "Haggai", abbreviation: "Hag", testament: "OT", genre: "Prophecy", chapters: 2 },
  { number: 38, name: "Zechariah", abbreviation: "Zech", testament: "OT", genre: "Prophecy", chapters: 14 },
  { number: 39, name: "Malachi", abbreviation: "Mal", testament: "OT", genre: "Prophecy", chapters: 4 },
  { number: 40, name: "Matthew", abbreviation: "Matt", testament: "NT", genre: "Gospel", chapters: 28 },
  { number: 41, name: "Mark", abbreviation: "Mark", testament: "NT", genre: "Gospel", chapters: 16 },
  { number: 42, name: "Luke", abbreviation: "Luke", testament: "NT", genre: "Gospel", chapters: 24 },
  { number: 43, name: "John", abbreviation: "John", testament: "NT", genre: "Gospel", chapters: 21 },
  { number: 44, name: "Acts", abbreviation: "Acts", testament: "NT", genre: "History", chapters: 28 },
  { number: 45, name: "Romans", abbreviation: "Rom", testament: "NT", genre: "Epistle", chapters: 16 },
  { number: 46, name: "1 Corinthians", abbreviation: "1Cor", testament: "NT", genre: "Epistle", chapters: 16 },
  { number: 47, name: "2 Corinthians", abbreviation: "2Cor", testament: "NT", genre: "Epistle", chapters: 13 },
  { number: 48, name: "Galatians", abbreviation: "Gal", testament: "NT", genre: "Epistle", chapters: 6 },
  { number: 49, name: "Ephesians", abbreviation: "Eph", testament: "NT", genre: "Epistle", chapters: 6 },
  { number: 50, name: "Philippians", abbreviation: "Phil", testament: "NT", genre: "Epistle", chapters: 4 },
  { number: 51, name: "Colossians", abbreviation: "Col", testament: "NT", genre: "Epistle", chapters: 4 },
  { number: 52, name: "1 Thessalonians", abbreviation: "1Thess", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 53, name: "2 Thessalonians", abbreviation: "2Thess", testament: "NT", genre: "Epistle", chapters: 3 },
  { number: 54, name: "1 Timothy", abbreviation: "1Tim", testament: "NT", genre: "Epistle", chapters: 6 },
  { number: 55, name: "2 Timothy", abbreviation: "2Tim", testament: "NT", genre: "Epistle", chapters: 4 },
  { number: 56, name: "Titus", abbreviation: "Titus", testament: "NT", genre: "Epistle", chapters: 3 },
  { number: 57, name: "Philemon", abbreviation: "Phlm", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 58, name: "Hebrews", abbreviation: "Heb", testament: "NT", genre: "Epistle", chapters: 13 },
  { number: 59, name: "James", abbreviation: "Jas", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 60, name: "1 Peter", abbreviation: "1Pet", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 61, name: "2 Peter", abbreviation: "2Pet", testament: "NT", genre: "Epistle", chapters: 3 },
  { number: 62, name: "1 John", abbreviation: "1John", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 63, name: "2 John", abbreviation: "2John", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 64, name: "3 John", abbreviation: "3John", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 65, name: "Jude", abbreviation: "Jude", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 66, name: "Revelation", abbreviation: "Rev", testament: "NT", genre: "Prophecy", chapters: 22 },
];

export const OLD_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === "OT");
export const NEW_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === "NT");

export function getBookByName(name: string): BookInfo | undefined {
  return BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === name.toLowerCase() ||
           b.abbreviation.toLowerCase() === name.toLowerCase()
  );
}

export function getBookByNumber(number: number): BookInfo | undefined {
  return BIBLE_BOOKS.find((b) => b.number === number);
}

export function getBookSlug(bookName: string): string {
  return bookName.toLowerCase().replace(/\s+/g, "-");
}

export function getBookNameFromSlug(slug: string): string | undefined {
  const book = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase().replace(/\s+/g, "-") === slug
  );
  return book?.name;
}

export const BOOK_GENRES = Array.from(new Set(BIBLE_BOOKS.map((b) => b.genre)));
