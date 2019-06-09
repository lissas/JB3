import React from "react";
import Prism from "prismjs";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import _ from "lodash";
import styled from "@emotion/styled";
import { DiscussionEmbed, CommentCount } from "disqus-react";

import * as colors from "../styles/colors";
import { Layout } from "../components/common";
import { PostNavigation } from "../components/common";
import { MetaData } from "../components/common/meta";

import "../styles/prism-tomorrow.css";

/**
 * Single post view (/:slug)
 *
 * This file renders a single post and loads all the content.
 *
 */

const LoadCommentsButton = styled.span`
  display: block;
  max-width: 170px;
  text-align: center;
  margin: 30px auto 50px;
  color: ${colors.secondary};
  border: 1px solid #c7d5d86e;
  padding: 0px 15px;
  font-size: 12px;
  transition: all 0.3s;

  &:hover {
    cursor: pointer;
    text-decoration: none;
    background-color: #c7d5d814;
  }
`;

class Post extends React.Component {
  constructor() {
    super();

    this.state = {
      disqusID: null,
      showComments: false,
    };
  }

  componentDidMount() {
    Prism.highlightAll();

    setTimeout(() => {
      console.log(this.props);
      this.setState({
        disqusID: window.disqusID || this.props.data.ghostPost.slug,
      });
    }, 1000);
  }

  handleShowComments = () => {
    this.setState({ showComments: true });
  };

  render() {
    const { data, location } = this.props;
    const { showComments, disqusID } = this.state;
    const post = data.ghostPost;
    const posts = data.allGhostPost.edges;
    const { next, previous } = _.find(posts, p => p.node.id === post.id);
    const disqusConfig = {
      shortname: process.env.GATSBY_DISQUS_NAME,
      config: { identifier: disqusID, title: post.title },
    };

    return (
      <>
        <MetaData data={data} location={location} type="article" />
        <Layout>
          <div className="container">
            <article className="content">
              {post.feature_image ? (
                <figure className="post-feature-image">
                  <img src={post.feature_image} alt={post.title} />
                </figure>
              ) : null}
              <section className="post-full-content">
                <h1 className="content-title">{post.title}</h1>

                {/* The main post content */}
                <section
                  className="content-body load-external-scripts"
                  dangerouslySetInnerHTML={{ __html: post.html }}
                />
                {disqusID && !showComments && (
                  <LoadCommentsButton onClick={this.handleShowComments}>
                    <CommentCount {...disqusConfig}>Load Comments</CommentCount>
                  </LoadCommentsButton>
                )}

                {showComments && <DiscussionEmbed {...disqusConfig} />}
              </section>
            </article>
          </div>
          <PostNavigation nextPost={next} prevPost={previous} />
        </Layout>
      </>
    );
  }
}

Post.propTypes = {
  data: PropTypes.shape({
    ghostPost: PropTypes.shape({
      title: PropTypes.string.isRequired,
      html: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      feature_image: PropTypes.string,
    }).isRequired,
  }).isRequired,
  location: PropTypes.object.isRequired,
};

export default Post;

export const postQuery = graphql`
  query($slug: String!) {
    ghostPost(slug: { eq: $slug }) {
      ...GhostPostFields
    }
    allGhostPost(sort: { order: DESC, fields: [published_at] }) {
      edges {
        node {
          ...GhostPostFields
        }
        previous {
          ...GhostPostFields
        }
        next {
          ...GhostPostFields
        }
      }
    }
  }
`;
