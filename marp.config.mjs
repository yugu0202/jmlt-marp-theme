import markdownItMark from 'markdown-it-mark';
import markdownItAttr from 'markdown-it-attrs';
import markdownItContainer from 'markdown-it-container';

export default {
	engine: ({ marp }) => {
		return marp
			.use(markdownItMark)
			.use(markdownItAttr, {
				leftDelimiter: '{',
				rightDelimiter: '}',
				allowedAttributes: [],
			})
			.use(markdownItContainer, '', {
				validate: () => true,
				render: (tokens, idx) => {
					// tokens[idx].info は `::: mycontainer {id="myid" data-foo="bar"}` の部分
					// tokens[idx].attrs には markdownItAttr がパースした属性が入っている
					const classFromInfo = tokens[idx].info.trim().split('{')[0].trim(); // `:::` の後に続くクラス名やテキスト

					if (tokens[idx].nesting === 1) {
						// オープニングタグ
						let allAttrs = [];

						// 1. `tokens[idx].info` から抽出されたクラスを最初のクラスとする
						if (classFromInfo) {
							allAttrs.push(['class', classFromInfo]);
						}

						// 2. `markdownItAttr` がパースした属性を追加/結合する
						if (tokens[idx].attrs) {
							tokens[idx].attrs.forEach(([attrName, attrValue]) => {
								if (attrName === 'class') {
									// 既存のクラスがあれば結合
									const existingClassIndex = allAttrs.findIndex(attr => attr[0] === 'class');
									if (existingClassIndex !== -1) {
										allAttrs[existingClassIndex][1] += ` ${attrValue}`;
									} else {
										allAttrs.push(['class', attrValue]);
									}
								} else {
									// その他の属性はそのまま追加
									allAttrs.push([attrName, attrValue]);
								}
							});
						}

						// 属性をHTML文字列に変換
						const attrsHtml = allAttrs.map(([attrName, attrValue]) =>
							`${attrName}="${attrValue}"`
						).join(' ');

						return `<div ${attrsHtml}>\n`;
					}

					return '</div>\n';
				},
			}
		);
	},
	themeSet: './themes/',
}
