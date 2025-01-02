import { TwitterApi } from "twitter-api-v2";
import {
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_BEARER_TOKEN,
} from "../config";

const client = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
});

const twitterBearer = new TwitterApi(TWITTER_BEARER_TOKEN);
const searchClient = twitterBearer.readOnly;

async function searchLatestTweet(queryKey: string): Promise<any> {
  try {
    console.log(queryKey);
    const tweets = await searchClient.v2.search({
      query: `${queryKey} 叙事 -is:retweet -is:reply`,
      max_results: 40,
      "tweet.fields": ["text"],
      sort_order: "recency",
    });
    if (!tweets?.data?.data?.length || tweets.data.meta.result_count === 0) {
      return "";
    }
    return tweets?.data?.data.map((value) => ({ text: value.text })).toString();
  } catch (error) {
    console.error("Twitter search error:", error);
    throw new Error(`搜索推文出错：${error}`);
  }
}

export { searchLatestTweet };
