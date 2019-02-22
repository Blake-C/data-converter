import knex from 'knex'
import pandoc from 'node-pandoc'
import fs from 'node-fs-extra'

const knex_query = knex({
	client: 'mysql',
	connection: {
		host: 'localhost',
		port: '3306', // when using docker you need to expose mysql port
		user: 'root',
		password: 'root',
		database: 'wp_foundation_six',
	},
})

function joomla_articles(table, live_domain = 'http://localhost/', output_dir = './_output/articles/') {
	knex_query
		.from(table)
		.select('id', 'title', 'alias', 'introtext', 'fulltext')
		.then(rows => {
			rows.forEach(row => {
				const body_content = `${row.introtext} ${row.fulltext}`
				const fixed_urls = body_content.replace(/(href|src)="(?!http|https|mailto)/gm, `$1="${live_domain}`)
				const page_url = `${live_domain}index.php?option=com_content&view=article&id=${row.id}`

				const html_content = `
					<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
					</head>
					<body>
						<p>Site URL: <a href="${page_url}">${page_url}</a></p>
						<hr/>
						<h1>${row.title}</h1>
						${fixed_urls}
					</body>
					</html>
				`

				fs.mkdirs(output_dir)

				// Arguments can be either a single String or in an Array
				const args = `-f html -t docx -o ${output_dir}${row.id}--${row.alias}.docx`

				// Set your callback function
				const callback = (err, result) => {
					if (err) console.error('Oh Nos: ', err)
					return console.log(result), result
				}

				// Call pandoc
				pandoc(html_content, args, callback)
			})
		})
}
// joomla_articles('xer2k_content')

function wordpress_posts(table, live_domain = 'http://localhost/', output_dir = './_output/posts/') {
	knex_query
		.from(table)
		.where(function() {
			this.where('post_type', 'post').orWhere('post_type', 'page')
		})
		.select('id', 'post_title', 'post_content', 'post_name', 'post_type')
		.then(rows => {
			rows.forEach(row => {
				const body_content = `${row.post_content}`
				const fixed_urls = body_content.replace(/(href|src)="(?!http|https|mailto)/gm, `$1="${live_domain}`)

				const html_content = `
					<!DOCTYPE html>
					<html lang="en">
					<head>
						<meta charset="UTF-8">
					</head>
					<body>
						<p>Site URL: <a href="${live_domain}?p=${row.id}">${live_domain}?p=${row.id}</a></p>
						<hr/>
						<h1>${row.post_title}</h1>
						${fixed_urls}
					</body>
					</html>
				`

				fs.mkdirs(output_dir)

				// Arguments can be either a single String or in an Array
				const args = `-f html -t docx -o ${output_dir}${row.id}--${row.post_type}--${row.post_name}.docx`

				// Set your callback function
				const callback = (err, result) => {
					if (err) console.error('Oh Nos: ', err)
					return console.log(result), result
				}

				// Call pandoc
				pandoc(html_content, args, callback)
			})
		})
}
// wordpress_posts('cmbu_posts')
