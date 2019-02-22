import knex from 'knex'
import pandoc from 'node-pandoc'

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

knex_query
	.from('xer2k_content')
	.select('id', 'title', 'alias', 'introtext', 'fulltext')
	.then(rows => {
		rows.forEach(row => {
			const body_content = `${row.introtext} ${row.fulltext}`
			const fixed_urls = body_content.replace(/(href|src)="(?!http|https|mailto)/gm, '$1="http://localhost/')

			const html_content = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
				</head>
				<body>
					<h1>${row.title}</h1>
					${fixed_urls}
				</body>
				</html>
			`

			// Arguments can be either a single String or in an Array
			let args = `-f html -t docx -o ./_output/articles/${row.id}--${row.alias}.docx`

			// Set your callback function
			const callback = (err, result) => {
				if (err) console.error('Oh Nos: ', err)
				return console.log(result), result
			}

			// Call pandoc
			pandoc(html_content, args, callback)
		})
	})
