export interface Subject {
  name: string;
  icon: string;
  url: string;
}

export interface SubjectsData {
  [level: string]: {
    [className: string]: Subject[];
  };
}

export const SUBJECTS: SubjectsData = {
  "Pre-Primary": {
    "L.K.G": [
      { name: "Hindi Alphabet", icon: "Font", url: "#" },
      { name: "English Alphabet", icon: "SpellCheck", url: "#" },
      { name: "Counting", icon: "Hash", url: "#" },
      { name: "Color Recognition", icon: "Palette", url: "#" },
      { name: "Shape Recognition", icon: "Shapes", url: "#" },
      { name: "Story Listening", icon: "BookOpen", url: "#" },
    ],
    "U.K.G": [
      { name: "Hindi Writing", icon: "PenTool", url: "#" },
      { name: "English Writing", icon: "PenTool", url: "#" },
      { name: "Number Writing", icon: "Plus", url: "#" },
      { name: "Extra Activity", icon: "Paintbrush", url: "#" },
    ],
  },
  "Primary (1st–5th)": {
    "1st": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Extra Activity", icon: "Dumbbell", url: "#" },
    ],
    "2nd": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Extra Activity", icon: "Dumbbell", url: "#" },
    ],
    "3rd": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Extra Activity", icon: "Paintbrush", url: "#" },
    ],
    "4th": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Environmental Studies", icon: "Leaf", url: "#" },
      { name: "Extra Activity", icon: "Paintbrush", url: "#" },
    ],
    "5th": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Environmental Studies", icon: "Leaf", url: "#" },
      { name: "Extra Activity", icon: "Paintbrush", url: "#" },
    ],
  },
  "Upper Primary (6th–8th)": {
    "6th": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Science", icon: "FlaskConical", url: "#" },
      { name: "Social Science", icon: "Globe2", url: "#" },
    ],
    "7th": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Science", icon: "FlaskConical", url: "#" },
      { name: "Social Science", icon: "Globe2", url: "#" },
    ],
    "8th": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Science", icon: "FlaskConical", url: "#" },
      { name: "Social Science", icon: "Globe2", url: "#" },
    ],
  },
  "High School (9th–10th)": {
    "9th": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Science", icon: "FlaskConical", url: "#" },
      { name: "Social Science", icon: "Globe2", url: "#" },
    ],
    "10th": [
      { name: "Hindi", icon: "Languages", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "Science", icon: "FlaskConical", url: "#" },
      { name: "Social Science", icon: "Globe2", url: "#" },
    ],
  },
  "Intermediate (11th–12th)": {
    "11th": [
      { name: "Physics", icon: "Atom", url: "#" },
      { name: "Chemistry", icon: "FlaskRound", url: "#" },
      { name: "Biology", icon: "Dna", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Hindi", icon: "Languages", url: "#" },
    ],
    "12th": [
      { name: "Physics", icon: "Atom", url: "#" },
      { name: "Chemistry", icon: "FlaskRound", url: "#" },
      { name: "Biology", icon: "Dna", url: "#" },
      { name: "Mathematics", icon: "Calculator", url: "#" },
      { name: "English", icon: "Globe", url: "#" },
      { name: "Hindi", icon: "Languages", url: "#" },
    ],
  },
};

export const TOPPERS_DATA: { [className: string]: string[] } = {
  "L.K.G": [
    "https://picsum.photos/seed/topper1/350/200",
    "https://picsum.photos/seed/topper2/350/200",
    "https://picsum.photos/seed/topper3/350/200",
  ],
  "U.K.G": [
    "https://picsum.photos/seed/topper4/350/200",
    "https://picsum.photos/seed/topper5/350/200",
    "https://picsum.photos/seed/topper6/350/200",
  ],
  "1st": [
    "https://picsum.photos/seed/topper7/350/200",
    "https://picsum.photos/seed/topper8/350/200",
    "https://picsum.photos/seed/topper9/350/200",
  ],
  "2nd": [
    "https://picsum.photos/seed/topper10/350/200",
    "https://picsum.photos/seed/topper11/350/200",
    "https://picsum.photos/seed/topper12/350/200",
  ],
  "3rd": [
    "https://picsum.photos/seed/topper13/350/200",
    "https://picsum.photos/seed/topper14/350/200",
    "https://picsum.photos/seed/topper15/350/200",
  ],
  "4th": [
    "https://picsum.photos/seed/topper16/350/200",
    "https://picsum.photos/seed/topper17/350/200",
    "https://picsum.photos/seed/topper18/350/200",
  ],
  "5th": [
    "https://picsum.photos/seed/topper19/350/200",
    "https://picsum.photos/seed/topper20/350/200",
    "https://picsum.photos/seed/topper21/350/200",
  ],
  "6th": [
    "https://picsum.photos/seed/topper22/350/200",
    "https://picsum.photos/seed/topper23/350/200",
    "https://picsum.photos/seed/topper24/350/200",
  ],
  "7th": [
    "https://picsum.photos/seed/topper25/350/200",
    "https://picsum.photos/seed/topper26/350/200",
    "https://picsum.photos/seed/topper27/350/200",
  ],
  "8th": [
    "https://picsum.photos/seed/topper28/350/200",
    "https://picsum.photos/seed/topper29/350/200",
    "https://picsum.photos/seed/topper30/350/200",
  ],
  "9th": [
    "https://picsum.photos/seed/topper31/350/200",
    "https://picsum.photos/seed/topper32/350/200",
    "https://picsum.photos/seed/topper33/350/200",
  ],
  "10th": [
    "https://picsum.photos/seed/topper34/350/200",
    "https://picsum.photos/seed/topper35/350/200",
    "https://picsum.photos/seed/topper36/350/200",
  ],
  "11th": [
    "https://picsum.photos/seed/topper37/350/200",
    "https://picsum.photos/seed/topper38/350/200",
    "https://picsum.photos/seed/topper39/350/200",
  ],
  "12th": [
    "https://picsum.photos/seed/topper40/350/200",
    "https://picsum.photos/seed/topper41/350/200",
    "https://picsum.photos/seed/topper42/350/200",
  ],
};

export const CARD_COLORS = [
  "#7953d1",
  "#28bcae",
  "#66bb6a",
  "#42a5f5",
  "#f05561",
  "#755346",
  "#ffa726",
  "#26a69a",
];

export const TEACHERS = [
  "https://picsum.photos/seed/teacher1/400/300",
  "https://picsum.photos/seed/teacher2/400/300",
  "https://picsum.photos/seed/teacher3/400/300",
  "https://picsum.photos/seed/teacher4/400/300",
  "https://picsum.photos/seed/teacher5/400/300",
  "https://picsum.photos/seed/teacher6/400/300",
];

export const STUDY_SLIDES = [
  "https://picsum.photos/seed/study1/400/200",
  "https://picsum.photos/seed/study2/400/200",
  "https://picsum.photos/seed/study3/400/200",
];
