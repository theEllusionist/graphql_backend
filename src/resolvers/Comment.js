const Comment  = {
  author(parent,args,ctx,info) {
    return ctx.prisma.comments.findUnique({
      where:{id:parent.id}
    }).author()
  },

  post(parent,args,ctx,info) {
    return ctx.prisma.comments.findUnique({
      where:{id:parent.id}
    }).post()
  }
} 

module.exports=Comment