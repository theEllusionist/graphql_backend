const User = {
  posts(parent,args,ctx,info) {
    return ctx.prisma.users.findUnique({
      where:{id:parent.id}
    }
    ).posts();
  },
  comments(parent,args,ctx,info) {
    return ctx.prisma.users.findUnique({
      where:{id:parent.id}
    }
    ).comments();
  },

  email(parent,args,ctx) {
    const {user_id}=ctx;
    if(user_id===parent.id) {
      return parent.email;
    }
    return null
  },

  password(parent,args,ctx) {
    const {user_id}=ctx;
    if(user_id===parent.id) {
      return parent.password;
    }
    return null
  }


}
module.exports =User;


