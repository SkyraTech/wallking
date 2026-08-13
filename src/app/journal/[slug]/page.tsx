import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { posts, getPost, formatPostDate, postsByNewest } from "@/lib/data/posts";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/journal/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.dek,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.dek,
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

export default async function JournalPostPage(
  props: PageProps<"/journal/[slug]">,
) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = postsByNewest.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.dek,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: `${site.url}/journal/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Header over a parallaxing ground */}
      <header className="relative isolate -mt-20 overflow-hidden pt-20 lg:-mt-24 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <Parallax speed={0.14} cover className="absolute inset-0">
            <WallpaperSwatch
              spec={post.art}
              seed={`post-hero-${post.slug}`}
              className="h-full w-full"
              priority
              lit={false}
            />
          </Parallax>
          <div className="absolute inset-0 bg-void/92" />
        </div>

        <Container>
          <div className="py-16 lg:py-24">
            <Reveal>
              <nav aria-label="Breadcrumb" className="mb-9">
                <ol className="flex items-center gap-2 text-[0.6875rem] uppercase tracking-[0.08em] text-ink-3">
                  <li>
                    <Link href="/" className="link-draw hover:text-ink">
                      Home
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden className="opacity-40">/</span>
                    <Link href="/journal" className="link-draw hover:text-ink">
                      Journal
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden className="opacity-40">/</span>
                    <span className="text-ink">{post.category}</span>
                  </li>
                </ol>
              </nav>
            </Reveal>

            <Reveal>
              <Eyebrow className="mb-7">{post.category}</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display-xl max-w-4xl text-ink">{post.title}</h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="lede mt-7 max-w-2xl">{post.dek}</p>
            </Reveal>
            <Reveal delay={300}>
              <p className="eyebrow mt-9 text-ink-3">
                {formatPostDate(post.date)} · {post.readingMinutes} min read ·{" "}
                {post.author}
              </p>
            </Reveal>
          </div>
        </Container>
      </header>

      {/* Body — narrow measure, the way long-form should be set */}
      <Container>
        <article className="mx-auto max-w-[42rem] py-16 lg:py-20">
          {post.body.map((block, i) => {
            if (block.type === "h") {
              return (
                <Reveal key={i}>
                  <h2 className="display-md mt-14 text-ink first:mt-0">
                    {block.text}
                  </h2>
                </Reveal>
              );
            }
            if (block.type === "quote") {
              return (
                <Reveal key={i}>
                  <blockquote className="my-12 border-l-2 border-accent pl-7">
                    <p className="font-display text-2xl leading-snug text-ink">
                      “{block.text}”
                    </p>
                    {block.cite && (
                      <cite className="eyebrow mt-4 block not-italic text-ink-3">
                        {block.cite}
                      </cite>
                    )}
                  </blockquote>
                </Reveal>
              );
            }
            if (block.type === "list") {
              return (
                <Reveal key={i}>
                  <ul className="my-8 space-y-3">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-4 border-b border-line-faint pb-3 text-[1.0625rem] leading-relaxed text-ink-2"
                      >
                        <span aria-hidden className="mt-1 text-accent">
                          —
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            }
            return (
              <Reveal key={i}>
                <p className="mt-5 text-[1.0625rem] leading-[1.78] text-ink-2">
                  {block.text}
                </p>
              </Reveal>
            );
          })}

          <Reveal>
            <div className="mt-16 border-t border-line pt-10">
              <Eyebrow className="mb-5">Next step</Eyebrow>
              <p className="text-[1.0625rem] leading-relaxed text-ink-2">
                Every point above is easier to judge with the paper in your
                hand. Our Hyderabad galleries hold current books at full drop,
                and samples go home with you.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <CTA href="/collections">Browse collections</CTA>
                <CTA href="/showrooms" tone="outline">
                  Visit a showroom
                </CTA>
              </div>
            </div>
          </Reveal>
        </article>
      </Container>

      {/* More reading */}
      <section className="border-t border-line bg-deep py-20">
        <Container wide>
          <Reveal>
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <h2 className="display-lg text-ink">Keep reading</h2>
              <CTA href="/journal" tone="outline">
                All articles
              </CTA>
            </div>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-3">
            {more.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link href={`/journal/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden border border-line">
                    <WallpaperSwatch
                      spec={p.art}
                      seed={`more-${p.slug}`}
                      className="h-full w-full transition-transform duration-[1500ms] [transition-timing-function:var(--ease-cut)] group-hover:scale-105"
                    />
                  </div>
                  <p className="eyebrow mt-4 text-accent">{p.category}</p>
                  <h3 className="mt-2.5 font-display text-xl leading-snug text-ink transition-colors duration-500 group-hover:text-accent">
                    {p.title}
                  </h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
