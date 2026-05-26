const CLIENTS = [
  { id: "C124", name: "Dra Anna HOF", sid: "1N2oAsy3PJud__z9MBSFrX9wr1AVfw_b-X-YpgDHIdkQ" },
  { id: "C123a", name: "Dr Rafael Rocha", sid: "1iX55z4aFf7CIzLHD0OVGdZCeCWrMfgK-hE_3LLAkfko" },
  { id: "C52", name: "Dr Lucas Pitão", sid: "1ssM8yBQsSpby-y7FXqs8NmWAAjzsfigxhR4P4J7mfys" },
  { id: "C63", name: "Dr Raphael Moreira", sid: "1hnJ7rl0Hcy2GcWdh3nMN7s9nhBCtahKsHYiQglAF_JE" },
  { id: "C123b", name: "Orgulho São Vicente", sid: "1-Xp3qunysH4vw8jrU8wWW0g8eTzLK2pt4jmoSxMDId0" },
  { id: "C123c", name: "Orgulho Sorrir Santos", sid: "1bWYYqtG_2TZ3Zs0r5wkvadSI8gEMAug-9nZUp-jxYuc" },
  { id: "C86", name: "Dr William Henrique", sid: "14Ss2564FyP_SJeXxTI8OI-5n0tRMlchsJJYFJrxRrxY" },
  { id: "C135", name: "Dra Michelle Santos", sid: "1pQpLfdt9gCHoRekLRpqFk9pwW2V51ksCN_NTJd1G_zY" },
  { id: "C136", name: "Integrare Odontologia", sid: "1TEuyWftgK9iM2rINKEeg-xTAZGVFxibmWZpokn6XCEc" },
  { id: "C123d", name: "Orgulho Sorrir Peruíbe", sid: "17_CS-0I470XfX5sQMLAd0jdQJxng4gFCBkO1eaQx8qA" },
  { id: "C140", name: "Espaço Bottega", sid: "1AAcB8qjEf-NDM36lPTCOuUst7tsACIvfNe4QgsJf_yM" },
  { id: "C149", name: "Clínica GGlow", sid: "1zOwuPWh_g2fLHyfmBfHl1RIPYznzGdf7yGidGnq9qN0" },
  { id: "C148", name: "Los Angeles Estética", sid: "1zBcRC0HaV4JXg1Cix-XBl6cZzQ6044oFMhM3NlTZn7E" },
  { id: "C150", name: "Lumia Odontologia", sid: "1fVoRc627ZhHEBKFIGuGvvtiMDBrO_2D3Wp2mWZlH3Go" },
  { id: "C152", name: "Dr Ariel Figueira", sid: "1WFTrrqeiaYa9WCzaLcchnKDnpnWr6VG6n-PRwvYf8tI" },
  { id: "C151", name: "Oral Mais Beltrão", sid: "1GA6X-NLnj3VYhIRRkcpvOcOwUrzlUhhvWcI4sW22XrU" },
  { id: "C142", name: "Dra Maria E. Krieger", sid: "1AnHkl8G4jmxNcRY5jYuiPo4M02JHTpHG3dpmOZysuE0" },
  { id: "C155", name: "Clínica Elodonto", sid: "17eesV8xZKnisx9pJo11RndZOcKDwIT6zet8dBfHrPlM" },
  { id: "C153", name: "Dra Lorenna Campos", sid: "1cOJAkSMqbJVBHX6RUMibxQEoAQHwEu1I3snXTvcxqOY" },
  { id: "C158", name: "Victoriano Faces", sid: "12dTGJBLDOdxxPAX0WJJR7R6Zhu_NtZ9xX19VsUvdK8A" },
  { id: "C157", name: "Dra Cristiane Tiburtino", sid: "1bM8T1h-gAZdbOgjWQqkFoJPU_vODLI-ObIt9OtTLGic" },
  { id: "C156", name: "ImplanteDay", sid: "1WsTH2JpoX5HyXqAD6xAN3_GBL84flGi-qUvGCoGSHcc" },
  { id: "C159", name: "Dra Carolina Macedo", sid: "1whMQoVCZMBO9mvLW62lf6FYTeutsBjlGpxfBhuYVVOs" },
  { id: "C161", name: "Botocenter Alphaville", sid: "1YEZlqqIaTKVGUOUxQzxUQ-yjjzc3EYvyOYp96y_Q4vY" },
  { id: "C162", name: "Dr Bruno Araújo", sid: "1Vc5IT497LN25AUD8ckoH7CkXJ-72O7ypn8ZxuoAUELg" },
  { id: "C163", name: "Acesso Saúde CIC", sid: "1SuyRNdYrGZXtBFmB0-Hv91ZICa7geeFHx6Ayiz7jU08" },
  { id: "C164", name: "Dra Lea", sid: "1hQu7EiDa6hI0Wr7WVdcSBNg2eiaLucOw6P_mDgNkd0Y" },
];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const MONTH_NAMES = {
  "jan.": 0, "fev.": 1, "mar.": 2, "abr.": 3, "mai.": 4, "jun.": 5,
  "jul.": 6, "ago.": 7, "set.": 8, "out.": 9, "nov.": 10, "dez.": 11,
};

function monthIndex(row) {
  const name = (row[8] || "").toLowerCase().trim();
  return MONTH_NAMES[name] ?? -1;
}

function yearStr(row) {
  return String(row[26] || row[0]?.match(/\b(20\d{2})\b/)?.[1] || "");
}

export { CLIENTS, MONTHS, monthIndex, yearStr };
