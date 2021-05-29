const Subscription = {
  post:{
    subscribe(parent,args,{pubsub}) {
      return pubsub.asyncIterator('post')
    }
  },
  comment:{
    async subscribe(parent,args,ctx) {
      const post = await ctx.prisma.posts.findFirst({
        where:{
          id:{
            equals:args.post_id
          },
          published:{
            equals:true
          }
        }
      });
      if(!post) {
        throw new Error('Post not found');
      }
      return ctx.pubsub.asyncIterator(`comment ${args.post_id}`);
    }
  },

  // myPost:{
  //   async subscribe(parent,args,ctx) {
  //     const {user_id}=ctx;

  //   }
  // }

}

module.exports = Subscription