
const _ = require('lodash')

const express = require('express')
const {graphqlHTTP} = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull,
} = require('graphql')
const app = express()

const authors = [
    { id: "1", name: 'J. K. Rowling' },
    { id: "2", name: 'J. R. R. Tolkien' },
    { id: "3", name: 'Brent Weeks' }
]

const books = [
    { id: "1", name: 'Harry Potter and the Chamber of Secrets', authorId: "1" },
    { id: "2", name: 'Harry Potter and the Prisoner of Azkaban', authorId: "1" },
    { id: "3", name: 'Harry Potter and the Goblet of Fire' , authorId: "1" },
    { id: "4", name: 'The Fellowship of the Ring', authorId: "2" },
    { id: "5", name: 'The Two Towers', authorId: "2" },
    { id: "6", name: 'The Return of the King', authorId: "2" },
    { id: "7", name: 'The Way of Shadows', authorId: "3" },
    { id: "8", name: 'Beyond the Shadows', authorId: "3" }
]

let BookType = new GraphQLObjectType({
    name: 'Book', 
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLID) },
        author: { 
            type: AuthorType,
            resolve: (parent, args) => {
                return authors.find((author) => {
                    return author.id === parent.authorId
                })
            }
        }
    })
})

let AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (parent, args) => {
                return books.filter((book) => {
                    return book.authorId === parent.id
                })
            }
        }

    })
})

// query is always the root of the request
// fields off query are the individual datatypes being served
let query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single book',
            args: { id: { type: GraphQLID } },
            resolve: (parent, args) => books.find(book => {
                console.log('book.id', typeof book.id, '\n', 'args.id', typeof args.id)
                return book.id == args.id
            })
        },

        books: {
            type: new GraphQLList(BookType),
            description: 'A list of books',
            resolve: () => books
        },

        author: {
            type: AuthorType,
            description: 'An author',
            args: { id: { type: GraphQLID } },
            resolve: (parent, args) => authors.find(author => {

                return author.id === args.id
            })
        },

        authors: {
            type: new GraphQLList(AuthorType),
            description: 'A list of authors',
            resolve: () => authors
        }

    })
})

let mutation = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLID) }
            },
            resolve: (parent, args) => {
                const book = { 
                    id: books.length + 1, 
                    name: args.name, authorId: 
                    args.authorId 
                }

                books.push(book)
                return book
            }
        },

        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                }

                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: query,
    mutation: mutation
})

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema,
}))

app.listen(5000, () => {
    console.log('listening on port 5000')
})