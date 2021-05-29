const Query = {

  async users(parent,args,ctx){
    return await ctx.prisma.users.findMany({
      where:{
        name:{
          contains:args.name
        }
      }
    })
  },

  async user(parent,args,ctx){
    const {user_id}=ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }
    return await ctx.prisma.users.findFirst({
      where: {
        id:user_id
      }
    })
  },
  async usersPosts(parent,args,ctx) {
    const {user_id}=ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }

    return await ctx.prisma.posts.findMany({
      where:{
        user_id: user_id
      }
    }
    )
  },
  async postById(parent,args,ctx) {
    const {user_id}=ctx;
    console.log(user_id)
    const post =await ctx.prisma.posts.findFirst({
      where:{
       AND:[{
         id:args.id
       },{
         OR:[{
           published:true
         },{
           user_id:user_id
         }]
       }]
      }
    })
    if(!post) {
      throw new Error("Post not found")
    }
    return post
  }, 

  async posts(parent,args,ctx) {
    const {user_id}=ctx;

    const posts = await ctx.prisma.posts.findMany({
      where:{
        OR:[{
          published:true
        },{
          user_id:user_id
        }]
      }
    })

    if(posts.length===0) {
      throw new Error("No Post Found")
    }
    return posts
  }

  
  
}

module.exports=Query;