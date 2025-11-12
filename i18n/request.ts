import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async ({locale}) => {
  const locales = ["ko","en","ja","zh"] as const;
  const safe = (locales as readonly string[]).includes(locale) ? locale : "ko";
  return {
    locale: safe,
    messages: (await import(`./messages/${safe}.json`)).default
  };
});
