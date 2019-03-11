import Link from 'next/link';
import { getBlogPostsAPI, getBlogHomeAPI } from '../api';
import { RichText, Date } from 'prismic-reactjs';
import { linkResolver } from '../components/prismic';
import DefaultLayout from '../layouts';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doc: {},
      posts: []
    }
  }

  static async getInitialProps() {
    const response = await getBlogPostsAPI();
    const home = await getBlogHomeAPI();
    return {
      doc: home.data,
      posts: response.results
    };
  }

  firstParagraph(post) {
    // Find the first text slice of post's body
    let firstTextSlice = post.data.body.find(slice => slice.slice_type === 'text');
    if (firstTextSlice != null) {
      // Set the character limit for the text we'll show in the homepage
      const textLimit = 300;
      let text = RichText.asText(firstTextSlice.primary.text);
      let limitedText = text.substring(0, textLimit);

      if (text.length > textLimit) {
        // Cut only up to the last word and attach '...' for readability
        return (
          <p>{limitedText.substring(0, limitedText.lastIndexOf(' ')) + '...'}</p>
        );
      } else {
        // If it's shorter than the limit, just show it normally
        return <p>{text}</p>;
      }
    } else {
      // If there are no slices of type 'text', return nothing
      return null;
    }
  }

  renderHead() {
    const doc = this.props.doc;
    return(
      <React.Fragment>
      <div className="home">
        <div className="blog-avatar" style={{backgroundImage: 'url(' + doc.image.url +')'}}>
        </div>
        <h1 className="blog-title">{RichText.asText(doc.headline)}</h1>
        <p className="blog-description">{RichText.asText(doc.description)}</p>
      </div>
      <style jsx>{`
        .home {
          text-align: center;
          max-width: 700px;
          margin: auto;
        }

        .blog-avatar {
          height: 140px;
          width: 140px;
          border-radius: 50%;
          background-position: center;
          background-size: cover;
          margin: 1em auto;
        }

        .blog-description {
          font-size: 18px;
          color: #9A9A9A;
          line-height: 30px;
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          font-family: 'Lato', sans-serif;
          border-bottom: 1px solid #DADADA;
        }
      `}</style>
      </React.Fragment>
    );
  }

  renderPosts() {
    return(
      <React.Fragment>
      <div className="blog-main">
        {this.props.posts.map((post, index) => (
          <div className="blog-post" key={post.id}>
            <Link
              as={linkResolver(post)}
              href={`/post?uid=${post.uid}`}
              passHref
            >
              <a>{RichText.render(post.data.title, linkResolver)}</a>
            </Link>
            <p className="blog-post-meta">
              <time className="created-at">
                {/* Format the date to M d, Y */}
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short', 
                  day: '2-digit', 
                  year: 'numeric'
                }).format(Date(post.data.date))}
              </time>
            </p>
            {this.firstParagraph(post)}
          </div>
        ))}
      </div>
      <style jsx>{`
        .blog-main {
          max-width: 700px;
          margin: auto;
        }
        .blog-post {
          margin-bottom: 3rem;
        }
        .blog-post h2 {
          margin: 0;
        }
        .blog-post-meta {
          color: #9A9A9A;
          font-family: 'Lato', sans-serif;
          margin-bottom: 8px;
        }
      `}</style>
      </React.Fragment>
    );
  }

  render() {
    return(
      <DefaultLayout>
        {this.renderHead()}
        {this.renderPosts()}
      </DefaultLayout>
    );
  }
}