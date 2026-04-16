"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className="px-2 py-1 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
      style={{
        backgroundColor: active ? "var(--color-primary)" : "var(--color-surface-alt)",
        color: active ? "#fff" : "var(--color-text-bold)",
        border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
        minWidth: "28px",
      }}
    >
      {children}
    </button>
  );
}

export default function TipTapEditor({ content, onChange, placeholder = "Tulis konten artikel di sini…" }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-editor",
        style: "min-height:220px;outline:none;padding:16px;",
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes (e.g. when editing a different article)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Masukkan URL gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL link:", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "2px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap gap-1 p-2"
        style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <span style={{ width: 1, backgroundColor: "var(--color-border)", margin: "0 2px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
        <span style={{ width: 1, backgroundColor: "var(--color-border)", margin: "0 2px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          ❝
        </ToolbarButton>
        <span style={{ width: 1, backgroundColor: "var(--color-border)", margin: "0 2px" }} />
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Tambah Link">
          🔗
        </ToolbarButton>
        <ToolbarButton onClick={addImage} active={false} title="Tambah Gambar (URL)">
          🖼️
        </ToolbarButton>
        <span style={{ width: 1, backgroundColor: "var(--color-border)", margin: "0 2px" }} />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          ↪
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      <style>{`
        .prose-editor h2 { font-size: 1.25rem; font-weight: 800; margin: 12px 0 6px; color: var(--color-text-bold); }
        .prose-editor h3 { font-size: 1.05rem; font-weight: 700; margin: 10px 0 4px; color: var(--color-text-bold); }
        .prose-editor p { margin: 6px 0; color: var(--color-text); }
        .prose-editor ul { list-style: disc; padding-left: 20px; margin: 6px 0; }
        .prose-editor ol { list-style: decimal; padding-left: 20px; margin: 6px 0; }
        .prose-editor blockquote { border-left: 3px solid var(--color-primary); padding-left: 12px; margin: 8px 0; color: var(--color-text-muted); font-style: italic; }
        .prose-editor a { color: var(--color-accent); text-decoration: underline; }
        .prose-editor img { max-width: 100%; border-radius: 12px; margin: 8px 0; }
        .prose-editor strong { font-weight: 800; color: var(--color-text-bold); }
        .prose-editor em { font-style: italic; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--color-text-muted); pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  );
}
