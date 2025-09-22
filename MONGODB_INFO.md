# 🍃 MongoDB Atlas Configuration

Ứng dụng AI Travel Agent sử dụng MongoDB Atlas (cloud database) đã được cấu hình sẵn.

## 📊 Thông tin Database

- **Provider**: MongoDB Atlas (Cloud)
- **Cluster**: tiendat.1rokfhy.mongodb.net
- **Database Name**: vivu
- **Username**: Kaikun
- **Password**: Kaikun
- **Connection String**: 
  ```
  mongodb+srv://Kaikun:Kaikun@tiendat.1rokfhy.mongodb.net/vivu
  ```

## 🏗️ Database Schema

Ứng dụng sẽ tự động tạo các collections sau:

### 👤 Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  subscription: {
    type: String, // 'trial', 'monthly', 'yearly', 'expired'
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  usage: {
    trialUsed: Boolean,
    searchCount: Number,
    lastSearchDate: Date
  },
  paymentHistory: [{
    orderId: String,
    amount: Number,
    currency: String,
    subscriptionType: String,
    paymentDate: Date,
    status: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Tự động Setup

Khi chạy ứng dụng lần đầu:

1. **Mongoose** sẽ tự động kết nối đến MongoDB Atlas
2. **Collections** sẽ được tạo tự động khi có data đầu tiên
3. **Indexes** sẽ được tạo cho email (unique)
4. **Validation** sẽ được áp dụng theo schema

## 🌐 Network Access

MongoDB Atlas cluster đã được cấu hình:
- **IP Whitelist**: 0.0.0.0/0 (Allow from anywhere)
- **Network**: Public internet access
- **SSL**: Enabled (bắt buộc)

## 📈 Monitoring

Bạn có thể monitor database qua:
- **MongoDB Atlas Dashboard**: [cloud.mongodb.com](https://cloud.mongodb.com)
- **Application logs**: Console output khi connect
- **Mongoose connection events**: Success/error logs

## 🔒 Security

### Credentials
- Username/password đã được set
- Connection string sử dụng SSL/TLS
- Database access restricted by user permissions

### Best Practices
- ✅ Sử dụng environment variables
- ✅ SSL/TLS encryption
- ✅ User-based access control
- ❌ Không expose credentials trong code

## 🚨 Troubleshooting

### Connection Timeout
```
Error: MongooseServerSelectionError: connection timed out
```
**Solutions:**
- Kiểm tra internet connection
- Verify connection string đúng
- Check firewall không block MongoDB ports

### Authentication Failed
```
Error: Authentication failed
```
**Solutions:**
- Kiểm tra username/password: Kaikun/Kaikun
- Verify database name: vivu
- Check user permissions trong Atlas

### Network Error
```
Error: getaddrinfo ENOTFOUND
```
**Solutions:**
- DNS resolution issue
- Try different network
- Check if MongoDB Atlas is accessible

## 💾 Backup & Recovery

MongoDB Atlas tự động:
- **Continuous backup**: Point-in-time recovery
- **Snapshot backup**: Daily snapshots
- **Cross-region replication**: High availability

## 📊 Performance

Current cluster configuration:
- **Tier**: M0 (Free tier)
- **Storage**: 512 MB
- **RAM**: Shared
- **Connections**: 500 max concurrent

### Scaling Options
Khi cần scale up:
- **M2**: $9/month - 2GB storage
- **M5**: $25/month - 5GB storage  
- **M10**: $57/month - 10GB storage

## 🔄 Migration

Nếu cần migrate data:

### Export Data
```bash
mongodump --uri="mongodb+srv://Kaikun:Kaikun@tiendat.1rokfhy.mongodb.net/vivu"
```

### Import Data
```bash
mongorestore --uri="mongodb+srv://new-connection-string" dump/
```

## 📱 Local Development

Nếu muốn dùng local MongoDB:

1. **Install MongoDB Community Server**
2. **Update .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/vivu
   ```
3. **Start MongoDB service**
4. **Restart application**

## 🌟 Atlas Features

MongoDB Atlas cung cấp:
- **Charts**: Data visualization
- **Realm**: Backend-as-a-Service
- **Search**: Full-text search
- **Triggers**: Database triggers
- **Functions**: Serverless functions

## 📞 Support

Nếu gặp vấn đề với MongoDB:
- **MongoDB Documentation**: [docs.mongodb.com](https://docs.mongodb.com)
- **Atlas Support**: [support.mongodb.com](https://support.mongodb.com)
- **Community**: [community.mongodb.com](https://community.mongodb.com)

## 💡 Tips

1. **Monitor usage** để không vượt quá free tier limits
2. **Index optimization** cho queries thường dùng
3. **Connection pooling** đã được Mongoose handle
4. **Error handling** cho network issues
5. **Backup strategy** cho production data

Database đã sẵn sàng sử dụng! 🚀