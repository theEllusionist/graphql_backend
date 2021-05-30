const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const {v4} = require("uuid")
const Mutation = {
  async signUp(parent,args,ctx,info) {
    const password =await bcrypt.hash(args.data.password,10);
    const user = await ctx.prisma.users.create({
      data:{
        id:v4(),
        ...args.data,
        password
      }
    });

    const token = jwt.sign({user_id:user.id},process.env.JWT_SECRETE,{expiresIn:"7 days"});
    return {
      token,
      user
    };
  },

  async logIn(parent,args,ctx,info) {
    const user = await ctx.prisma.users.findFirst({
      where:{email:args.data.email}
    });
    if(!user) {
      throw new Error("Can't Auththenticate");
    }
    const valid = await bcrypt.compare(args.data.password,user.password);
    if(!valid) {
      throw new Error("Can't Auththenticate");
    }

    const token = await jwt.sign({user_id:user.id},process.env.JWT_SECRETE,{expiresIn:"7 days"});

    return {
      user,
      token
    }

  },


  async updateUser(parent,args,ctx,info) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }
    if(args.data.password!==undefined) {
      args.data.password = await bcrypt.hash(args.data.password,10)
    } 
    return await ctx.prisma.users.update({
      where:{id:user_id},
      data:{
        ...args.data
      }
    });
  },


  async deleteUser(parent,args,ctx,info) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }
    const post =await ctx.prisma.posts.findFirst({
      where:{
        user_id:user_id
      }
    })
    if(!post) {
      await ctx.prisma.posts.deleteMany({
        where:{
          auser_id:user_id
        }
      })
    }

    const comment =await ctx.prisma.comments.findFirst({
      where:{
        user_id:user_id
      }
    })
    if(!comment) {
      await ctx.prisma.posts.deleteMany({
        where:{
          user_id:args_id
        }
      })
    }

    return await ctx.prisma.users.delete({
      where:{id:user_id}
    })
  },

  async createPost(parent,args,ctx,info) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }

    const post= await ctx.prisma.posts.create({
      data:{
        id:v4(),
        ...args.data,
        user_id:user_id
      }
    });
    if(post.published===true) {
      ctx.pubsub.publish('post',{
        post:{
          mutation:"CREATED",
          post:post
        }
      })
    }
    return post;
  },
 
  async updatePost(parent,args,ctx,info) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }

    var post = await ctx.prisma.posts.findMany({
      where:{
        id:{
          equals:args.data.id
        },
        user_id:{
          equals:user_id
        }
      }
    })
    if(post.length===0) {
      throw new Error("Post not found")
    }
    if(args.data.published===false) {
      await ctx.prisma.comments.deleteMany({
        where:{
          post_id:args.data.id
        }
      })
    }
    post= await ctx.prisma.posts.update({
      where:{
        id:args.data.id
      },
      data:{
        ...args.data
      }
    });

    if(post.published===true) {
      ctx.pubsub.publish('post',{
        post:{
          mutation:"UPDATED",
          post:post
        }
      })
    }
    return post;
  },
  
  async deletePost(parent,args,ctx,info) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }

    var post = await ctx.prisma.posts.findFirst({
      where:{
        id:{
          equals:args.id
        },
        user_id:{
          equals:user_id
        }
      }
    })
    console.log(post)
    if(!post) {
      throw new Error("Post not found")
    }

    const comments = await ctx.prisma.comments.findFirst({
      where:{post_id:args.id}
    });

    if(!comments) {
      await ctx.prisma.comments.delete({
        where:{
          post_id:args.id
        }
      })
    }
    post= await ctx.prisma.posts.delete({
      where:{
        id:args.id
      },
    });

    if(post.published===true) {
      ctx.pubsub.publish('post',{
        post:{
          mutation:"DELETED",
          post:post
        }
      })
    }
    return post;
  },


  async createComment(parent,args,ctx,info) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }
    const isUsersPost = await ctx.prisma.posts.findFirst({
      where:{
        id:{
          equals:args.data.post_id
        },
       user_id:{
         equals:user_id,
       }

      }
    });
    
    if(isUsersPost!==null) {
      return await ctx.prisma.comments.create({
        data:{
          id:v4(),
          ...args.data,
          user_id
        }
      });
    }
    const isPublicPost = await ctx.prisma.posts.findFirst({
      where:{
        id:{
          equals:args.data.post_id
        },
       published:{
         equals:true,
       }

      }
    });

    if(!isPublicPost) {
      throw new Error("Post not found");
    }

    const comment= await ctx.prisma.comments.create({
      data:{
        id:v4(),
        ...args.data,
        user_id
      }
    });
    ctx.pubsub.publish(`comment ${args.data.post_id}`,{
      comment:{
        mutation:"CREATED",
        comment:comment
      }
    })
    return comment;
  },

  async updateComment(parent,args,ctx) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }

    var comment = await ctx.prisma.comments.findFirst({
      where:{
        id:{
          equals:args.data.id
        },
        user_id:{
          equals:user_id
        },
        post_id:{
          equals:args.data.post_id
        }
      }
    });
    if(!comment) {
      throw new Error ("Comment does not exist");
    }

    comment = await ctx.prisma.comments.update({
      where:{id:args.data.id},
      data:{
        ...args.data
      }
    })
    ctx.pubsub.publish(`comment ${args.data.post_id}`,{
      comment:{
        mutation:"UPDATED",
        comment:comment
      }
    });
    return comment
  },

  async deleteComment(parent,args,ctx) {
    const {user_id} = ctx;
    if(!user_id) {
      throw new Error("Authentication required")
    }

    var comment = await ctx.prisma.comments.findFirst({
      where:{
        OR:[{
          id:{
            equals:args.data.id
          },
          post_id:{
            equals:args.data.post_id
          },
          user_id:{
            equals:user_id
          }

        },{
          id:{
            equals:args.data.id
          },
          post :{
            user_id:{
              equals:user_id
            }
          }
        }
      
      ]
      }
    });

    if(!comment ) {
      throw new Error ("Comment does not exist");
    }
    comment =await ctx.prisma.comments.delete({
      where:{
        id:args.data.id
      }
    });
    ctx.pubsub.publish(`comment ${args.data.post_id}`,{
      comment:{
        mutation:"DELETED",
        comment:comment
      }
    });
    return comment;
  }

}


module.exports=Mutation