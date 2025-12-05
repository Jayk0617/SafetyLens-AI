import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import saveAs from "file-saver";
import { Question, QuestionType } from "../types";

export const generateWordDocument = async (questions: Question[], title: string = "安全实景隐患排查试题") => {
  
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  children.push(
    new Paragraph({
      text: `生成时间: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Group by type for better organization
  const grouped = {
    [QuestionType.SINGLE_CHOICE]: questions.filter(q => q.type === QuestionType.SINGLE_CHOICE),
    [QuestionType.MULTIPLE_CHOICE]: questions.filter(q => q.type === QuestionType.MULTIPLE_CHOICE),
    [QuestionType.TRUE_FALSE]: questions.filter(q => q.type === QuestionType.TRUE_FALSE),
  };

  // Helper to add section
  const addSection = (type: string, list: Question[]) => {
    if (list.length === 0) return;

    children.push(
      new Paragraph({
        text: type,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      })
    );

    list.forEach((q, index) => {
      // Question Content
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. ${q.content}`, bold: true }),
            new TextRun({ text: ` [${q.hazardFocus}]`, italics: true, color: "666666", size: 16 }),
          ],
          spacing: { before: 100, after: 100 },
        })
      );

      // Options
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, i) => {
          const labels = ["A", "B", "C", "D", "E", "F"];
          // Remove any existing A., B., etc. prefixes the AI might have generated
          const cleanOpt = opt.replace(/^[A-F][\.\:、\)\s]\s*/i, '');
          
          children.push(
            new Paragraph({
              text: `${labels[i] || '-'}. ${cleanOpt}`,
              indent: { left: 720 }, // Indent
            })
          );
        });
      }

      // Add some space
      children.push(new Paragraph({ text: "" }));
    });
  };

  addSection("一、单选题", grouped[QuestionType.SINGLE_CHOICE]);
  addSection("二、多选题", grouped[QuestionType.MULTIPLE_CHOICE]);
  addSection("三、判断题", grouped[QuestionType.TRUE_FALSE]);

  // Answer Key Section (Page Break before answers)
  children.push(new Paragraph({ pageBreakBefore: true }));
  children.push(
    new Paragraph({
      text: "答案与解析",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  questions.forEach((q, index) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${index + 1}. [${q.type}] `, bold: true }),
          new TextRun({ text: `正确答案: ${Array.isArray(q.answer) ? q.answer.join(", ") : q.answer}`, color: "D32F2F", bold: true }),
        ],
        spacing: { before: 100 },
      })
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "解析: ", bold: true }),
          new TextRun({ text: q.explanation }),
        ],
        spacing: { after: 200 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "安全实景试题库.docx");
};