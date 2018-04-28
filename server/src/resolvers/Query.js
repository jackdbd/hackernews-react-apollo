async function feed(parent, args, context, info) {
  // two 'where' conditions are specified: a link is only returned if either its
  // url or its description contain the provided filter
  const where = args.filter
    ? {
        OR: [
          { url_contains: args.filter },
          { description_contains: args.filter }
        ]
      }
    : {};

  const queriedLinkes = await context.db.query.links(
    { where, skip: args.skip, first: args.first, orderBy: args.orderBy },
    `{ id }`
  );

  const countSelectionSet = `
    {
      aggregate {
        count
      }
    }
  `;
  const linksConnection = await context.db.query.linksConnection(
    {},
    countSelectionSet
  );

  return {
    count: linksConnection.aggregate.count,
    linkIds: queriedLinkes.map(link => link.id)
  };
}

module.exports = {
  feed
};
