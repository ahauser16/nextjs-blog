# [Notes on NextJS tutorial](https://nextjs.org/learn/basics/data-fetching/two-forms)

In Next.js, you can use the Link Component next/link to link between pages in your application. <Link> allows you to do client-side navigation and accepts props that give you better control over the navigation behavior. Client-side navigation means that the page transition happens using JavaScript, which is faster than the default navigation done by the browser.

Next.js does code splitting automatically, so each page only loads what’s necessary for that page. That means when the homepage is rendered, the code for other pages is not served initially. Furthermore, in a production build of Next.js, whenever Link components appear in the browser’s viewport, Next.js automatically prefetches the code for the linked page in the background. By the time you click the link, the code for the destination page will already be loaded in the background, and the page transition will be near-instant!

## Two Forms of Pre-rendering

Next.js has two forms of pre-rendering: Static Generation and Server-side Rendering. The difference is in when it generates the HTML for a page.

- Static Generation is the pre-rendering method that generates the HTML at build time. The pre-rendered HTML is then reused on each request.
- Server-side Rendering is the pre-rendering method that generates the HTML on each request.

## When to Use Static Generation v.s. Server-side Rendering

We recommend using [Static Generation](https://nextjs.org/docs/basic-features/pages#static-generation-recommended) (with and without data) whenever possible because your page can be built once and served by CDN, which makes it much faster than having a server render the page on every request.

You can use Static Generation for many types of pages, including:

- Marketing pages
- Blog posts
- E-commerce product listings
- Help and documentation

You should ask yourself: "Can I pre-render this page ahead of a user's request?" If the answer is yes, then you should choose Static Generation.

On the other hand, Static Generation is not a good idea if you cannot pre-render a page ahead of a user's request. Maybe your page shows frequently updated data, and the page content changes on every request.

In that case, you can use [Server-side Rendering](https://nextjs.org/docs/basic-features/pages#server-side-rendering). It will be slower, but the pre-rendered page will always be up-to-date. Or you can skip pre-rendering and use client-side JavaScript to populate frequently updated data.

## Static Generation with and without Data

Static Generation can be done with and without data.

So far, all the pages we’ve created do not require fetching external data. Those pages will automatically be statically generated when the app is built for production.

However, for some pages, you might not be able to render the HTML without first fetching some external data. Maybe you need to access the file system, fetch external API, or query your database at build time. Next.js supports this case — [Static Generation with data](https://nextjs.org/docs/basic-features/pages#static-generation-with-data) — out of the box.

## Static Generation with Data using getStaticProps

How does it work? Well, in Next.js, when you export a page component, you can also export an async function called [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching/overview#getstaticprops-static-generation). If you do this, then:

`getStaticProps` runs at build time in production, and…
Inside the function, you can fetch external data and send it as props to the page.

```javascript
export default function Home(props) { ... }

export async function getStaticProps() {
  // Get external data from the file system, API, DB, etc.
  const data = ...

  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: ...
  }
}
```

Essentially, [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching/overview#getstaticprops-static-generation) allows you to tell Next.js: “Hey, this page has some data dependencies — so when you pre-render this page at build time, make sure to resolve them first!”

NB--> Note: In development mode, `getStaticProps` runs on each request instead.

## [Fetch External API or Query Database](https://nextjs.org/learn/basics/data-fetching/getstaticprops-details)

In lib/posts.js, we’ve implemented getSortedPostsData which fetches data from the file system. But you can fetch the data from other sources, like an external API endpoint, and it’ll work just fine:

```javascript
export async function getSortedPostsData() {
  // Instead of the file system,
  // fetch post data from an external API endpoint
  const res = await fetch("..");
  return res.json();
}
```

Note: Next.js polyfills fetch() on both the client and server. You don't need to import it.

You can also query the database directly:

```javascript
import someDatabaseSDK from 'someDatabaseSDK'

const databaseClient = someDatabaseSDK.createClient(...)

export async function getSortedPostsData() {
  // Instead of the file system,
  // fetch post data from a database
  return databaseClient.query('SELECT posts...')
}
```

This is possible because `getStaticProps` ONLY RUNS on the **server-side**. It will NEVER run on the **client-side**. It won’t even be included in the JS bundle for the browser. That means you can write code such as direct database queries without them being sent to browsers.

## Development vs. Production

- In **development** (`npm run dev` or `yarn dev`), `getStaticProps` runs on every request.
- In **production**, `getStaticProps` runs at build time. However, this behavior can be enhanced using the fallback key returned by getStaticPaths

Because it’s meant to be run at build time, you won’t be able to use data that’s only available during request time, such as query parameters or HTTP headers.

## Only Allowed in a Page

`getStaticProps` can only be exported from a `page`. You can’t export it from non-page files.

One of the reasons for this restriction is that React needs to have all the required data before the page is rendered.

## What If I Need to Fetch Data at Request Time?

Since Static Generation happens once at build time, it's not suitable for data that updates frequently or changes on every user request.

In cases like this, where your data is likely to change, you can use Server-side Rendering. Let's learn more about server-side rendering in the next section.

## [Fetching Data at Request Time](https://nextjs.org/learn/basics/data-fetching/request-time)

If you need to fetch data at request time instead of at build time, you can try Server-side Rendering:

To use Server-side Rendering, you need to export getServerSideProps instead of `getStaticProps` from your page.

## Using getServerSideProps

Here’s the starter code for getServerSideProps. It’s not necessary for our blog example, so we won’t be implementing it.

```javascript
export async function getServerSideProps(context) {
  return {
    props: {
      // props for your component
    },
  };
}
```

Because `getServerSideProps` is called at request time, its parameter (context) contains request specific parameters.

You should use `getServerSideProps` only if you need to pre-render a page whose data must be fetched at request time. Time to first byte (**TTFB**) will be slower than `getStaticProps` because the server must compute the result on every request, and the result cannot be cached by a **CDN** without extra configuration.

## Client-side Rendering

If you do not need to pre-render the data, you can also use the following strategy (called Client-side Rendering):

- Statically generate (pre-render) parts of the page that do not require external data.
- When the page loads, fetch external data from the client using JavaScript and populate the remaining parts.

![alt text](https://nextjs.org/static/images/learn/data-fetching/client-side-rendering.png)

This approach works well for user dashboard pages, for example. Because a dashboard is a private, user-specific page, SEO is not relevant, and the page doesn’t need to be pre-rendered. The data is frequently updated, which requires request-time data fetching.

## [SWR](https://nextjs.org/learn/basics/data-fetching/request-time)

The team behind Next.js has created a React hook for data fetching called [SWR](https://swr.vercel.app/). We **highly recommend it** if you’re _fetching data_ on the **client side**. It handles caching, revalidation, focus tracking, refetching on interval, and more. We won’t cover the details here, but here’s an example usage:

```javascript
import useSWR from "swr";

function Profile() {
  const { data, error } = useSWR("/api/user", fetch);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <div>hello {data.name}!</div>;
}
```

Check out the [SWR](https://swr.vercel.app/) documentation to learn more.

Again, you can get in-depth information about getStaticProps and getServerSideProps in the [Data Fetching documentation](https://nextjs.org/docs/basic-features/data-fetching/overview#getstaticprops-static-generation).

**When should you use Client-side rendering? When you need to fetch data at request time instead of build time.**

## [Dynamic Routes](https://nextjs.org/learn/basics/dynamic-routes)

We’ve populated the index page with the blog data, but we still haven’t created individual blog pages yet (here’s the desired result). We want the URL for these pages to depend on the blog data, which means we need to use dynamic routes.

### What You'll Learn in This Lesson

- How to statically generate pages with dynamic routes using getStaticPaths.
- How to write getStaticProps to fetch the data for each blog post.
- How to render markdown using remark.
- How to pretty-print date strings.
- How to link to a page with dynamic routes.
- Some useful information on dynamic routes.

### [Page Path Depends on External Data](https://nextjs.org/learn/basics/dynamic-routes/page-path-external-data)

In the previous lesson, we covered the case where the **page content** depends on external data. We used getStaticProps to fetch required data to render the index page.

In this lesson, we’ll talk about the case where each **page path** depends on external data. Next.js allows you to statically generate pages with paths that depend on external data. This enables **dynamic URLs** in Next.js.

![alt text](https://nextjs.org/static/images/learn/dynamic-routes/page-path-external-data.png)

### How to Statically Generate Pages with Dynamic Routes

In our case, we want to create dynamic routes for blog posts:

- We want each post to have the path `/posts/<id>`, where `<id>` is the name of the markdown file under the top-level `posts` directory.
- Since we have `ssg-ssr.md` and `pre-rendering.md`, we’d like the paths to be `/posts/ssg-ssr` and `/posts/pre-rendering`.

### Overview of the Steps

We can do this by taking the following steps. You don’t have to make these changes yet — we’ll do it all on the next page.

First, we’ll create a page called `[id].js` under `pages/posts`. Pages that begin with `[` and end with `]` are [dynamic routes](https://nextjs.org/docs/routing/dynamic-routes) in Next.js.

In `pages/posts/[id].js`, we’ll write code that will render a post page — just like other pages we’ve created.

```javascript
import Layout from "../../components/layout";

export default function Post() {
  return <Layout>...</Layout>;
}
```

Now, here’s what’s new: We’ll export an async function called [getStaticPaths](https://nextjs.org/docs/basic-features/data-fetching/overview#getstaticpaths-static-generation) from this page. In this function, we need to return a list of **possible values** for id.

```javascript
import Layout from "../../components/layout";

export default function Post() {
  return <Layout>...</Layout>;
}

export async function getStaticPaths() {
  // Return a list of possible value for id
}
```

Finally, we need to implement [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching/overview#getstaticpaths-static-generation) again - this time, to fetch necessary data for the blog post with a given `id`. [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching/overview#getstaticpaths-static-generation) is given `params`, which contains `id` (because the file name is `[id].js`).

```javascript
import Layout from "../../components/layout";

export default function Post() {
  return <Layout>...</Layout>;
}

export async function getStaticPaths() {
  // Return a list of possible value for id
}

export async function getStaticProps({ params }) {
  // Fetch necessary data for the blog post using params.id
}
```

Here’s a graphic summary of what we just talked about:

![alt text](https://nextjs.org/static/images/learn/dynamic-routes/how-to-dynamic-routes.png)

## [Dynamic Routes Details](https://nextjs.org/learn/basics/dynamic-routes/dynamic-routes-details)

### Fetch External API or Query Database

Like `getStaticProps`, `getStaticPaths` can fetch data from any data source. In our example, getAllPostIds (which is used by `getStaticPaths`) may fetch from an external API endpoint:

```javascript
export async function getAllPostIds() {
  // Instead of the file system,
  // fetch post data from an external API endpoint
  const res = await fetch("..");
  const posts = await res.json();
  return posts.map((post) => {
    return {
      params: {
        id: post.id,
      },
    };
  });
}
```

### Development vs. Production

- In development (npm run dev or yarn dev), getStaticPaths runs on every request.
- In production, getStaticPaths runs at build time.

### Fallback

Recall that we returned `fallback: false` from [getStaticPaths](https://nextjs.org/docs/basic-features/data-fetching/overview#getstaticpaths-static-generation). What does this mean?

If [fallback is false](https://nextjs.org/docs/basic-features/data-fetching/overview#fallback-false), then any paths not returned by `getStaticPaths` will result in a 404 page.

If [fallback is true](https://nextjs.org/docs/basic-features/data-fetching/overview#fallback-true), then the behavior of getStaticProps changes:

- The paths returned from getStaticPaths will be rendered to HTML at build time.
- The paths that have not been generated at build time will not result in a 404 page. Instead, Next.js will serve a “fallback” version of the page on the first request to such a path.
- In the background, Next.js will statically generate the requested path. Subsequent requests to the same path will serve the generated page, just like other pages pre-rendered at build time.

If [fallback is blocking](https://nextjs.org/docs/basic-features/data-fetching/overview#fallback-blocking), then new paths will be server-side rendered with getStaticProps, and cached for future requests so it only happens once per path.

This is beyond the scope of our lessons, but you can learn more about fallback: true and fallback: 'blocking' in the fallback documentation.

### Catch-all Routes

Dynamic routes can be extended to catch all paths by adding three dots (...) inside the brackets. For example:

- pages/posts/[...id].js matches /posts/a, but also /posts/a/b, /posts/a/b/c and so on.

If you do this, in `getStaticPaths`, you must return an array as the value of the id key like so:

```javascript
return [
  {
    params: {
      // Statically Generates /posts/a/b/c
      id: ["a", "b", "c"],
    },
  },
  //...
];
```

And `params.id` will be an array in `getStaticProps`:

```javascript
export async function getStaticProps({ params }) {
  // params.id will be like ['a', 'b', 'c']
}
```

Take a look at the [catch all routes documentation](https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes) to learn more.

## [API Routes](https://nextjs.org/learn/basics/api-routes/creating-api-routes)

### Creating API Routes

API Routes let you create an API endpoint inside a Next.js app. You can do so by creating a function inside the pages/api directory that has the following format:

```javascript
// req = HTTP incoming message, res = HTTP server response
export default function handler(req, res) {
  // ...
}
```

**Note that:**

- req is an instance of http.IncomingMessage, plus some pre-built middlewares.
- res is an instance of http.ServerResponse, plus some helper functions.

### API Routes Details

Here is some essential information you should know about [API Routes](https://nextjs.org/docs/api-routes/introduction).

### Do Not Fetch an API Route from getStaticProps or getStaticPaths

You should **not** fetch an API Route from `getStaticProps` or `getStaticPaths`. Instead, write your server-side code directly in `getStaticProps` or `getStaticPaths` (or call a helper function).

Here’s why: `getStaticProps` and `getStaticPaths` run only on the server-side and will never run on the client-side. Moreover, these functions will not be included in the JS bundle for the browser. That means you can write code such as direct database queries without sending them to browsers. Read the [Writing Server-Side code](https://nextjs.org/docs/basic-features/data-fetching/get-static-props#write-server-side-code-directly) documentation to learn more.

### A Good Use Case: Handling Form Input

A good use case for API Routes is handling form input. For example, you can create a form on your page and have it send a `POST` request to your API Route. You can then write code to directly save it to your database. The API Route code will not be part of your client bundle, so you can safely write server-side code.
```javascript
export default function handler(req, res) {
  const email = req.body.email;
  // Then save email to your database, etc...
}
```

### Preview Mode

**Static Generation** is useful when your pages fetch data from a headless Content Management System (CMS). However, it’s **not** ideal when you’re writing a **draft** on your headless CMS *and* want to **preview the draft** immediately on your page. You’d want Next.js to render these pages at request time *instead* of build time and fetch the draft content instead of the published content. You’d want Next.js to bypass **Static Generation** only for this specific case.

Next.js has a feature called Preview Mode to solve the problem above, and it utilizes API Routes. To learn more about it take a look at our [Preview Mode documentation](https://nextjs.org/docs/advanced-features/preview-mode).

Remember that a good use case for an API Route could be:
- Saving incoming data to your database
- Securely communicating with a third-party API
- Previewing draft content from your CMS

## Deployment to Vercel


