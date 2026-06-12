export interface BookInfo {
  number: number;
  name: string;
  name_id: string;
  abbreviation: string;
  testament: "OT" | "NT";
  genre: string;
  chapters: number;
}

export const BIBLE_BOOKS: BookInfo[] = [
  { number: 1, name: "Genesis", name_id: "Kejadian", abbreviation: "Gen", testament: "OT", genre: "Law", chapters: 50 },
  { number: 2, name: "Exodus", name_id: "Keluaran", abbreviation: "Exod", testament: "OT", genre: "Law", chapters: 40 },
  { number: 3, name: "Leviticus", name_id: "Imamat", abbreviation: "Lev", testament: "OT", genre: "Law", chapters: 27 },
  { number: 4, name: "Numbers", name_id: "Bilangan", abbreviation: "Num", testament: "OT", genre: "Law", chapters: 36 },
  { number: 5, name: "Deuteronomy", name_id: "Ulangan", abbreviation: "Deut", testament: "OT", genre: "Law", chapters: 34 },
  { number: 6, name: "Joshua", name_id: "Yosua", abbreviation: "Josh", testament: "OT", genre: "History", chapters: 24 },
  { number: 7, name: "Judges", name_id: "Hakim-Hakim", abbreviation: "Judg", testament: "OT", genre: "History", chapters: 21 },
  { number: 8, name: "Ruth", name_id: "Rut", abbreviation: "Ruth", testament: "OT", genre: "History", chapters: 4 },
  { number: 9, name: "1 Samuel", name_id: "1 Samuel", abbreviation: "1Sam", testament: "OT", genre: "History", chapters: 31 },
  { number: 10, name: "2 Samuel", name_id: "2 Samuel", abbreviation: "2Sam", testament: "OT", genre: "History", chapters: 24 },
  { number: 11, name: "1 Kings", name_id: "1 Raja-Raja", abbreviation: "1Kgs", testament: "OT", genre: "History", chapters: 22 },
  { number: 12, name: "2 Kings", name_id: "2 Raja-Raja", abbreviation: "2Kgs", testament: "OT", genre: "History", chapters: 25 },
  { number: 13, name: "1 Chronicles", name_id: "1 Tawarikh", abbreviation: "1Chr", testament: "OT", genre: "History", chapters: 29 },
  { number: 14, name: "2 Chronicles", name_id: "2 Tawarikh", abbreviation: "2Chr", testament: "OT", genre: "History", chapters: 36 },
  { number: 15, name: "Ezra", name_id: "Ezra", abbreviation: "Ezra", testament: "OT", genre: "History", chapters: 10 },
  { number: 16, name: "Nehemiah", name_id: "Nehemia", abbreviation: "Neh", testament: "OT", genre: "History", chapters: 13 },
  { number: 17, name: "Esther", name_id: "Ester", abbreviation: "Esth", testament: "OT", genre: "History", chapters: 10 },
  { number: 18, name: "Job", name_id: "Ayub", abbreviation: "Job", testament: "OT", genre: "Wisdom", chapters: 42 },
  { number: 19, name: "Psalms", name_id: "Mazmur", abbreviation: "Ps", testament: "OT", genre: "Poetry", chapters: 150 },
  { number: 20, name: "Proverbs", name_id: "Amsal", abbreviation: "Prov", testament: "OT", genre: "Wisdom", chapters: 31 },
  { number: 21, name: "Ecclesiastes", name_id: "Pengkhotbah", abbreviation: "Eccl", testament: "OT", genre: "Wisdom", chapters: 12 },
  { number: 22, name: "Song of Solomon", name_id: "Kidung Agung", abbreviation: "Song", testament: "OT", genre: "Poetry", chapters: 8 },
  { number: 23, name: "Isaiah", name_id: "Yesaya", abbreviation: "Isa", testament: "OT", genre: "Prophecy", chapters: 66 },
  { number: 24, name: "Jeremiah", name_id: "Yeremia", abbreviation: "Jer", testament: "OT", genre: "Prophecy", chapters: 52 },
  { number: 25, name: "Lamentations", name_id: "Ratapan", abbreviation: "Lam", testament: "OT", genre: "Poetry", chapters: 5 },
  { number: 26, name: "Ezekiel", name_id: "Yehezkiel", abbreviation: "Ezek", testament: "OT", genre: "Prophecy", chapters: 48 },
  { number: 27, name: "Daniel", name_id: "Daniel", abbreviation: "Dan", testament: "OT", genre: "Prophecy", chapters: 12 },
  { number: 28, name: "Hosea", name_id: "Hosea", abbreviation: "Hos", testament: "OT", genre: "Prophecy", chapters: 14 },
  { number: 29, name: "Joel", name_id: "Yoel", abbreviation: "Joel", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 30, name: "Amos", name_id: "Amos", abbreviation: "Amos", testament: "OT", genre: "Prophecy", chapters: 9 },
  { number: 31, name: "Obadiah", name_id: "Obaja", abbreviation: "Obad", testament: "OT", genre: "Prophecy", chapters: 1 },
  { number: 32, name: "Jonah", name_id: "Yunus", abbreviation: "Jonah", testament: "OT", genre: "Prophecy", chapters: 4 },
  { number: 33, name: "Micah", name_id: "Mikha", abbreviation: "Mic", testament: "OT", genre: "Prophecy", chapters: 7 },
  { number: 34, name: "Nahum", name_id: "Nahum", abbreviation: "Nah", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 35, name: "Habakkuk", name_id: "Habakuk", abbreviation: "Hab", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 36, name: "Zephaniah", name_id: "Zefanya", abbreviation: "Zeph", testament: "OT", genre: "Prophecy", chapters: 3 },
  { number: 37, name: "Haggai", name_id: "Hagai", abbreviation: "Hag", testament: "OT", genre: "Prophecy", chapters: 2 },
  { number: 38, name: "Zechariah", name_id: "Zakharia", abbreviation: "Zech", testament: "OT", genre: "Prophecy", chapters: 14 },
  { number: 39, name: "Malachi", name_id: "Maleakhi", abbreviation: "Mal", testament: "OT", genre: "Prophecy", chapters: 4 },
  { number: 40, name: "Matthew", name_id: "Matius", abbreviation: "Matt", testament: "NT", genre: "Gospel", chapters: 28 },
  { number: 41, name: "Mark", name_id: "Markus", abbreviation: "Mark", testament: "NT", genre: "Gospel", chapters: 16 },
  { number: 42, name: "Luke", name_id: "Lukas", abbreviation: "Luke", testament: "NT", genre: "Gospel", chapters: 24 },
  { number: 43, name: "John", name_id: "Yohanes", abbreviation: "John", testament: "NT", genre: "Gospel", chapters: 21 },
  { number: 44, name: "Acts", name_id: "Kisah Para Rasul", abbreviation: "Acts", testament: "NT", genre: "History", chapters: 28 },
  { number: 45, name: "Romans", name_id: "Roma", abbreviation: "Rom", testament: "NT", genre: "Epistle", chapters: 16 },
  { number: 46, name: "1 Corinthians", name_id: "1 Korintus", abbreviation: "1Cor", testament: "NT", genre: "Epistle", chapters: 16 },
  { number: 47, name: "2 Corinthians", name_id: "2 Korintus", abbreviation: "2Cor", testament: "NT", genre: "Epistle", chapters: 13 },
  { number: 48, name: "Galatians", name_id: "Galatia", abbreviation: "Gal", testament: "NT", genre: "Epistle", chapters: 6 },
  { number: 49, name: "Ephesians", name_id: "Efesus", abbreviation: "Eph", testament: "NT", genre: "Epistle", chapters: 6 },
  { number: 50, name: "Philippians", name_id: "Filipi", abbreviation: "Phil", testament: "NT", genre: "Epistle", chapters: 4 },
  { number: 51, name: "Colossians", name_id: "Kolose", abbreviation: "Col", testament: "NT", genre: "Epistle", chapters: 4 },
  { number: 52, name: "1 Thessalonians", name_id: "1 Tesalonika", abbreviation: "1Thess", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 53, name: "2 Thessalonians", name_id: "2 Tesalonika", abbreviation: "2Thess", testament: "NT", genre: "Epistle", chapters: 3 },
  { number: 54, name: "1 Timothy", name_id: "1 Timotius", abbreviation: "1Tim", testament: "NT", genre: "Epistle", chapters: 6 },
  { number: 55, name: "2 Timothy", name_id: "2 Timotius", abbreviation: "2Tim", testament: "NT", genre: "Epistle", chapters: 4 },
  { number: 56, name: "Titus", name_id: "Titus", abbreviation: "Titus", testament: "NT", genre: "Epistle", chapters: 3 },
  { number: 57, name: "Philemon", name_id: "Filemon", abbreviation: "Phlm", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 58, name: "Hebrews", name_id: "Ibrani", abbreviation: "Heb", testament: "NT", genre: "Epistle", chapters: 13 },
  { number: 59, name: "James", name_id: "Yakobus", abbreviation: "Jas", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 60, name: "1 Peter", name_id: "1 Petrus", abbreviation: "1Pet", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 61, name: "2 Peter", name_id: "2 Petrus", abbreviation: "2Pet", testament: "NT", genre: "Epistle", chapters: 3 },
  { number: 62, name: "1 John", name_id: "1 Yohanes", abbreviation: "1John", testament: "NT", genre: "Epistle", chapters: 5 },
  { number: 63, name: "2 John", name_id: "2 Yohanes", abbreviation: "2John", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 64, name: "3 John", name_id: "3 Yohanes", abbreviation: "3John", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 65, name: "Jude", name_id: "Yudas", abbreviation: "Jude", testament: "NT", genre: "Epistle", chapters: 1 },
  { number: 66, name: "Revelation", name_id: "Wahyu", abbreviation: "Rev", testament: "NT", genre: "Prophecy", chapters: 22 },
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

// USFM book IDs used by bible.helloao.org — index 0 = book number 1 (Genesis)
export const USFM_BOOK_IDS: string[] = [
  "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA",
  "1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO",
  "ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO",
  "OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL",
  "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH",
  "PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS",
  "1PE","2PE","1JN","2JN","3JN","JUD","REV",
];
