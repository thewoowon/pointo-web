import Image from "next/image";
import Link from "next/link";

import type { PostMeta } from "@/lib/blog/types";
import { CATEGORIES } from "@/lib/blog/types";

/**
 * 목록에 쓰는 글 카드.
 *
 * 카드에 발췌를 길게 넣지 않는다. 목록에서 세 줄씩 읽게 하면 어느 글도 안
 * 열린다. 제목이 절반, 한 줄 설명이 나머지 절반을 한다.
 */

export function PostCard({
  meta,
  minutes,
  featured = false,
}: {
  meta: PostMeta;
  minutes: number;
  featured?: boolean;
}) {
  const category = CATEGORIES[meta.category];

  return (
    <article
      className={
        featured
          ? "group relative overflow-hidden rounded-app-xl border border-border bg-surface transition-shadow hover:shadow-app-md sm:col-span-2"
          : "group relative rounded-app-xl border border-border bg-surface p-6 transition-shadow hover:shadow-app-md sm:p-7"
      }
    >
      {featured && meta.cover ? (
        <div className="grid sm:grid-cols-[1fr_0.8fr]">
          <div className="order-2 p-7 sm:order-1 sm:p-9">
            <CardMeta category={category.label} meta={meta} minutes={minutes} />
            <CardTitle meta={meta} large />
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {meta.description}
            </p>
          </div>
          <div className="order-1 flex items-end justify-center overflow-hidden bg-surface-alt sm:order-2">
            <Image
              src={`/screenshot/${meta.cover}.webp`}
              alt=""
              width={900}
              height={1487}
              sizes="240px"
              className="w-[180px] translate-y-4 sm:w-[220px]"
            />
          </div>
        </div>
      ) : (
        <>
          <CardMeta category={category.label} meta={meta} minutes={minutes} />
          <CardTitle meta={meta} />
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {meta.description}
          </p>
        </>
      )}
    </article>
  );
}

function CardMeta({
  category,
  meta,
  minutes,
}: {
  category: string;
  meta: PostMeta;
  minutes: number;
}) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="font-semibold text-primary">{category}</span>
      <span aria-hidden="true" className="text-app-text-lowest">
        ·
      </span>
      <time dateTime={meta.publishedAt} className="tabular text-app-text-low">
        {formatDate(meta.publishedAt)}
      </time>
      <span aria-hidden="true" className="text-app-text-lowest">
        ·
      </span>
      <span className="tabular text-app-text-low">{minutes}분</span>
    </div>
  );
}

function CardTitle({ meta, large = false }: { meta: PostMeta; large?: boolean }) {
  return (
    <h3
      className={`mt-3 font-bold leading-snug ${
        large ? "text-[22px] sm:text-[26px]" : "text-[18px] sm:text-[20px]"
      }`}
    >
      {/*
       * 링크를 카드 전체로 늘린다(`after:absolute inset-0`). 제목 글자만
       * 눌리는 카드는 폰에서 특히 답답하다.
       */}
      <Link
        href={`/blog/${meta.slug}`}
        className="after:absolute after:inset-0 group-hover:text-primary"
      >
        {meta.title}
      </Link>
    </h3>
  );
}

/** "2026. 8. 16." */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
