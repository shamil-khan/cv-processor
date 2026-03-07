export type TextDirection = "ltr" | "rtl";

export interface SectionCaption {
  name: string;
  title: string;
}

export interface AuthoringProfile {
  id: string;
  direction: TextDirection;
  detectionKeys: readonly string[];
  aliases: {
    locale: readonly string[];
    meta: readonly string[];

    personalContainer: readonly string[];
    name: readonly string[];
    titles: readonly string[];
    location: readonly string[];
    country: readonly string[];
    phone: readonly string[];
    email: readonly string[];
    photo: readonly string[];
    social: readonly string[];

    summary: readonly string[];
    skills: readonly string[];
    experience: readonly string[];
    education: readonly string[];
    awards: readonly string[];
    additional: readonly string[];
    projects: readonly string[];
    certifications: readonly string[];
    interests: readonly string[];

    category: readonly string[];
    items: readonly string[];
    company: readonly string[];
    position: readonly string[];
    duration: readonly string[];
    highlights: readonly string[];
    techs: readonly string[];
    institution: readonly string[];
    degree: readonly string[];
    field: readonly string[];
    courses: readonly string[];
    title: readonly string[];
    issuer: readonly string[];
    year: readonly string[];
    detail: readonly string[];
    logo: readonly string[];
    githubRepo: readonly string[];
    snapshot: readonly string[];
    onlineLink: readonly string[];
    label: readonly string[];
    value: readonly string[];
    from: readonly string[];
    to: readonly string[];
  };
  socialPlatforms: Record<string, readonly string[]>;
  captions: {
    personal: SectionCaption;
    summary: SectionCaption;
    skills: SectionCaption;
    experience: SectionCaption;
    education: SectionCaption;
    awards: SectionCaption;
    additional: SectionCaption;
    projects: SectionCaption;
    certifications: SectionCaption;
    interests: SectionCaption;
  };
  durationDelimiters: readonly string[];
}
