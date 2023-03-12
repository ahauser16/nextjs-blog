import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from '../../styles/utils.module.css';


//HOW TO STATICALLY GENERATE PAGES WITH DYNAMIC ROUTES
//if you want to statically generate a page at a path called "/posts/<id>" where <id> can be dynamic, then:
//1) create a page at "/pages/posts/" named "[id].js"
//2) [id].js must contain: (i) a React component to render the page, (ii) getStaticPaths which returns an array of possible values for 'id' and (iii) getStaticProps which fetches necessary data for the post with 'id'.

//With the changes below and to posts.js, this post page is now using the getPostData function in getStaticProps to get the post data and return it as props.  Now we need to update the `Post` component to use postData (see below).

//The params.id from getStaticProps({ params }) knows the key is named id the value is from the file name.


export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}

//see the README for how to use getStaticPaths() (just like how we use getStaticProps) to fetch data from any data source like how in our example below getAllPostIds can fetch an external API endpoint.
export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export default function Post({ postData }) {
    return (
      <Layout>
        <Head>
          <title>{postData.title}</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    );
  }
