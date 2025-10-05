<?php
// Readdy Theme main template
get_header();

if ( have_posts() ) {
  while ( have_posts() ) {
    the_post();
    the_content();
  }
} else {
  echo '<p>No content found</p>';
}

get_footer();