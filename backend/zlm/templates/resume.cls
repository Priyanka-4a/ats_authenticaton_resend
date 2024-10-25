\ProvidesClass{resume}[2024/10/21 v1.0 Resume class]

\LoadClass[12pt]{article} % Use article class as base with 10pt font size
\usepackage[parfill]{parskip} % Removes paragraph indentation
\usepackage{array} % For tabular environments
\usepackage{ifthen} % For if/else logic
\usepackage{titlesec} % For custom section formatting

% Set default font size and style for the name
\newcommand{\name}[1]{\def\@name{#1}}
\def\@name{}

% Centered name at the top
\def\printname{
  \begin{center}
    {\LARGE\bfseries \MakeUppercase{\@name}} % Uppercase name in large bold font
  \end{center}
}

% Redefine the start of the document to include the name
\let\ori@document=\document
\renewcommand{\document}{
  \ori@document
  \printname
}

% Define spacing and section formatting
\titleformat{\section}{\bfseries\uppercase}{\thesection}{1em}{}

%==== Custom Section Definitions ====% 
% Create custom section environment for the resume sections 
\newenvironment{rSection}[1]{
    \vspace{1em} % Add vertical space before section
    \hrule
    \textbf{\uppercase{#1}} % Print the section title in bold and uppercase
    \vspace{0.5em} % Add space between the title and the line
    \hrule % Draw a bold horizontal line after the section title
    \vspace{1em} % Add space after the line and before the section content
}
{
    \vspace{1em} % Add vertical space after the section content
}