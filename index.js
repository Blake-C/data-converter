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
			console.log('-------')
			console.log(row)

			const html_content = `
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
				</head>
				<body>
					<h1>${row.title}</h1>
					${row.introtext}
					${row.fulltext}
				</body>
				</html>
			`

			// Arguments can be either a single String or in an Array
			let args = `-f html -t docx -o ./_output/articles/${row.alias}.docx`

			// Set your callback function
			const callback = (err, result) => {
				if (err) console.error('Oh Nos: ', err)
				return console.log(result), result
			}

			// Call pandoc
			pandoc(html_content, args, callback)
		})
	})
