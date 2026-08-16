import Link from "next/link";

import { CATEGORIES, type Category } from "@/lib/blog/types";

/**
 * 카테고리 이동 줄. 목록 페이지와 카테고리 페이지가 같은 줄을 공유한다.
 *
 * `active`가 null이면 "전체"가 현재 위치다.
 */
export function CategoryNav({ active }: { active: Category | null }) {
  const items: { key: Category | null; label: string; href: string }[] = [
    { key: null, label: "전체", href: "/blog" },
    ...Object.values(CATEGORIES).map((c) => ({
      key: c.slug as Category,
      label: c.label,
      href: `/blog/category/${c.slug}`,
    })),
  ];

  return (
    <nav className="mt-10 flex flex-wrap gap-2" aria-label="카테고리">
      {items.map((item) => {
        const current = item.key === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              current
                ? "bg-primary text-white"
                : "bg-surface-alt text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
