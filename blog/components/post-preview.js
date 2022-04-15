import { VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { useContext } from 'react'
import { BlogContext } from '../../pages/blog/[...slug]'
import Avatar from '../components/avatar'
import DateComponent from '../components/date'
import BlogText from './common/text'
import CoverImage from './cover-image'
import Excerpt from './excerpt'
import TagsBar from './tags-bar'

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  readtime,
  content,
  tagsCollection,
}) {
  const { locale } = useContext(BlogContext)
  const url = `/blog/posts/${locale}/${slug}`;
  return (
    <VStack spacing="4" alignItems="flex-start">
      <CoverImage title={title} slug={slug} url={coverImage.url} height={'150px'} />
      <BlogText as="h3" fontWeight="bold" fontSize="3xl">
        <Link href={url}>
          <a className="hover:underline">{title}</a>
        </Link>
      </BlogText>
      <Excerpt excerpt={excerpt} content={content} url={url} />
      <DateComponent dateString={date} readtime={readtime} />
      <TagsBar tagsCollection={tagsCollection} />
      {author && <Avatar name={author.name} picture={author.picture} title={author.title} />}
    </VStack>
  )
}
