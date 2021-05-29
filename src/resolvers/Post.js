const Post = {
  author(parent,args,ctx,info) {
    return ctx.prisma.posts.findUnique({
      where:{id:parent.id}
    }).author();
  },
  comments(parent,args,ctx,info) {
    return ctx.prisma.posts.findUnique({
      where:{id:parent.id}
    }).comments();
  }
}

module.exports=Post