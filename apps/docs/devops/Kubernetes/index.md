# Kubernetes容器编排

## 简介

Kubernetes（通常简称为K8s）是一个开源的容器编排平台，用于自动化容器化应用的部署、扩展和管理。它最初由Google设计并捐赠给Cloud Native Computing Foundation（CNCF）。Kubernetes提供了一个可以跨主机集群部署和调度容器的平台，解决了容器化应用在生产环境中面临的诸多挑战。

## 核心概念与架构

### Kubernetes架构

Kubernetes采用主从架构，由控制平面（Control Plane）和工作节点（Worker Nodes）组成：

![Kubernetes架构](https://d33wubrfki0l68.cloudfront.net/2475489eaf20163ec0f54ddc1d92aa8d4c87c96b/e7c81/images/docs/components-of-kubernetes.svg)

#### 控制平面组件

- **API Server**：所有组件之间通信的核心，提供RESTful API
- **etcd**：分布式键值存储，保存集群所有数据
- **Scheduler**：监控新创建的Pod，并将其分配到节点
- **Controller Manager**：运行控制器进程，如节点控制器、副本控制器等
- **Cloud Controller Manager**：与云服务提供商交互的组件

#### 工作节点组件

- **kubelet**：确保容器在Pod中运行
- **kube-proxy**：维护节点上的网络规则，实现服务抽象
- **Container Runtime**：运行容器的软件，如Docker、containerd等

### 基本对象

Kubernetes中的基本对象包括：

1. **Pod**：最小部署单元，包含一个或多个容器
2. **Service**：定义Pod的访问方式，提供固定IP和负载均衡
3. **Volume**：数据持久化存储
4. **Namespace**：资源隔离机制，将集群分割成多个虚拟集群

### 控制器

控制器构建在基本对象之上，提供额外功能：

1. **ReplicaSet**：确保指定数量的Pod副本运行
2. **Deployment**：管理ReplicaSet，提供声明式更新
3. **StatefulSet**：管理有状态应用
4. **DaemonSet**：确保所有节点运行特定Pod
5. **Job/CronJob**：运行一次性或定时任务

## 安装与配置

### 本地开发环境

#### 使用Minikube

```bash
# 安装Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# 启动Minikube
minikube start

# 检查状态
minikube status
```

#### 使用kind (Kubernetes in Docker)

```bash
# 安装kind
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.11.1/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/

# 创建集群
kind create cluster

# 查看集群
kubectl cluster-info --context kind-kind
```

### 安装kubectl

kubectl是与Kubernetes集群交互的命令行工具：

```bash
# 下载最新版本
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# 安装
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 验证安装
kubectl version --client
```

### 生产环境部署

生产环境可以使用以下工具部署Kubernetes集群：

1. **kubeadm**：官方集群创建工具
2. **kops**：在AWS上创建生产级Kubernetes集群
3. **kubespray**：使用Ansible部署Kubernetes
4. **管理服务**：GKE (Google)、EKS (AWS)、AKS (Azure)等

## Kubernetes基本操作

### 命名空间管理

```bash
# 创建命名空间
kubectl create namespace my-namespace

# 查看命名空间
kubectl get namespaces

# 在特定命名空间中操作
kubectl -n my-namespace get pods
```

### Pod管理

```bash
# 创建Pod
kubectl run nginx --image=nginx

# 查看Pod
kubectl get pods

# 查看Pod详情
kubectl describe pod nginx

# 删除Pod
kubectl delete pod nginx

# 从YAML文件创建Pod
kubectl apply -f pod.yaml

# 查看Pod日志
kubectl logs nginx

# 在Pod中执行命令
kubectl exec -it nginx -- bash
```

### Deployment管理

```bash
# 创建Deployment
kubectl create deployment nginx --image=nginx --replicas=3

# 查看Deployment
kubectl get deployments

# 扩展Deployment
kubectl scale deployment nginx --replicas=5

# 更新镜像
kubectl set image deployment/nginx nginx=nginx:1.19

# 回滚Deployment
kubectl rollout undo deployment/nginx

# 查看Deployment历史
kubectl rollout history deployment/nginx
```

### Service管理

```bash
# 创建Service
kubectl expose deployment nginx --port=80 --type=ClusterIP

# 查看Service
kubectl get services

# 描述Service
kubectl describe service nginx

# 删除Service
kubectl delete service nginx
```

### 配置管理

```bash
# 创建ConfigMap
kubectl create configmap app-config --from-file=config.properties

# 创建Secret
kubectl create secret generic db-secret --from-literal=username=admin --from-literal=password=secret

# 查看ConfigMap
kubectl get configmaps

# 查看Secret
kubectl get secrets
```

## YAML配置文件

### Pod配置示例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:1.19
    ports:
    - containerPort: 80
    resources:
      limits:
        cpu: "0.5"
        memory: "512Mi"
      requests:
        cpu: "0.2"
        memory: "256Mi"
    livenessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
```

### Deployment配置示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.19
        ports:
        - containerPort: 80
        env:
        - name: NGINX_PORT
          value: "80"
        volumeMounts:
        - name: config-volume
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: config-volume
        configMap:
          name: nginx-config
```

### Service配置示例

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### Ingress配置示例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx-service
            port:
              number: 80
```

## 存储管理

### 持久卷（PV）与持久卷声明（PVC）

```yaml
# 持久卷
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-storage
spec:
  capacity:
    storage: 10Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /data/pv0001

# 持久卷声明
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-storage
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard
```

### 在Pod中使用PVC

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  containers:
  - name: app
    image: nginx
    volumeMounts:
    - mountPath: "/data"
      name: data-volume
  volumes:
  - name: data-volume
    persistentVolumeClaim:
      claimName: pvc-storage
```

### 存储类（StorageClass）

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2
  fsType: ext4
reclaimPolicy: Delete
allowVolumeExpansion: true
```

## 网络

### Service类型

Kubernetes提供多种Service类型：

1. **ClusterIP**：默认类型，仅集群内部可访问
2. **NodePort**：在每个节点上开放端口，可从外部访问
3. **LoadBalancer**：使用云提供商的负载均衡器
4. **ExternalName**：将Service映射到外部DNS名称

### 网络策略

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-allow
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
```

## 安全

### RBAC（基于角色的访问控制）

```yaml
# 创建Role
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]

# 创建RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: default
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### ServiceAccount

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account

---
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  serviceAccountName: app-service-account
  containers:
  - name: app
    image: myapp:1.0
```

### Pod安全策略

```yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  supplementalGroups:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  fsGroup:
    rule: 'MustRunAs'
    ranges:
      - min: 1
        max: 65535
  readOnlyRootFilesystem: true
```

## 高级功能

### HPA（水平Pod自动扩展）

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
```

### 亲和性与反亲和性

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: kubernetes.io/e2e-az-name
            operator: In
            values:
            - e2e-az1
            - e2e-az2
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
          - key: security
            operator: In
            values:
            - S1
        topologyKey: topology.kubernetes.io/zone
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - app
          topologyKey: kubernetes.io/hostname
  containers:
  - name: app
    image: app:1.0
```

### 污点与容忍度

```yaml
# 给节点添加污点
kubectl taint nodes node1 key=value:NoSchedule

# Pod容忍污点
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
  - name: nginx
    image: nginx
  tolerations:
  - key: "key"
    operator: "Equal"
    value: "value"
    effect: "NoSchedule"
```

## 部署策略

### 滚动更新

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  # ...其他配置
```

### 蓝绿部署

```yaml
# 蓝版本（当前版本）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
      - name: app
        image: myapp:1.0

# 绿版本（新版本）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
      - name: app
        image: myapp:2.0

# 服务（切换流量）
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # 切换到green进行流量切换
  ports:
  - port: 80
    targetPort: 8080
```

### 金丝雀发布

```yaml
# 主要部署（90%流量）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-main
spec:
  replicas: 9
  selector:
    matchLabels:
      app: myapp
      version: stable
  template:
    metadata:
      labels:
        app: myapp
        version: stable
    spec:
      containers:
      - name: app
        image: myapp:1.0

# 金丝雀部署（10%流量）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
      version: canary
  template:
    metadata:
      labels:
        app: myapp
        version: canary
    spec:
      containers:
      - name: app
        image: myapp:2.0

# 服务（同时选择两个版本）
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp  # 同时匹配stable和canary
  ports:
  - port: 80
    targetPort: 8080
```

## 监控与日志

### Prometheus + Grafana

```yaml
# 使用Helm安装Prometheus和Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
```

### 日志收集

使用EFK/ELK栈收集日志：

1. **Elasticsearch**：存储和索引日志
2. **Fluentd/Filebeat**：收集和转发日志
3. **Kibana**：可视化和分析日志

```yaml
# 使用Helm安装EFK栈
helm repo add elastic https://helm.elastic.co
helm repo update
helm install elasticsearch elastic/elasticsearch
helm install kibana elastic/kibana
helm install filebeat elastic/filebeat
```

## 故障排查

### 常见问题排查

```bash
# 查看Pod状态
kubectl get pods

# 查看Pod详情
kubectl describe pod <pod-name>

# 查看Pod日志
kubectl logs <pod-name>

# 查看容器日志
kubectl logs <pod-name> -c <container-name>

# 查看前一个容器的日志（如果容器重启）
kubectl logs <pod-name> --previous

# 查看节点状态
kubectl get nodes
kubectl describe node <node-name>

# 查看集群事件
kubectl get events --sort-by='.metadata.creationTimestamp'
```

### 常见Pod状态问题

1. **Pending**：Pod未被调度到节点
   - 资源不足
   - PV不可用
   - 节点选择器不匹配

2. **ImagePullBackOff**：无法拉取镜像
   - 镜像名称错误
   - 镜像仓库需要认证
   - 网络问题

3. **CrashLoopBackOff**：容器反复崩溃
   - 应用配置错误
   - 资源不足
   - 健康检查失败

4. **Error**：容器启动出错
   - 命令参数错误
   - 权限问题

## 最佳实践

### 资源管理

1. **设置资源请求和限制**：为每个容器设置CPU和内存请求与限制
2. **使用命名空间**：按团队或环境划分命名空间
3. **实施资源配额**：为命名空间设置资源配额
4. **使用HPA**：根据负载自动扩展应用

### 安全性

1. **最小权限原则**：使用RBAC限制权限
2. **使用网络策略**：限制Pod间通信
3. **使用安全上下文**：限制容器权限
4. **定期更新镜像**：修复安全漏洞
5. **扫描镜像**：使用工具检测镜像漏洞

### 高可用性

1. **多副本部署**：每个应用至少运行2-3个副本
2. **反亲和性调度**：将Pod分散到不同节点
3. **使用PDB**：设置Pod中断预算
4. **健康检查**：配置存活和就绪探针
5. **多区域部署**：跨多个可用区部署

### GitOps

1. **声明式配置**：所有资源使用YAML定义
2. **配置版本控制**：将配置存储在Git仓库
3. **自动化部署**：使用ArgoCD或Flux等工具
4. **环境一致性**：使用相同的配置部署多个环境

## 常用工具生态

### 包管理

- **Helm**：Kubernetes的包管理器
- **Kustomize**：无模板的Kubernetes配置管理

### CI/CD

- **ArgoCD**：GitOps持续交付工具
- **Flux**：GitOps操作器
- **Jenkins X**：云原生CI/CD平台
- **Tekton**：Kubernetes原生CI/CD系统

### 服务网格

- **Istio**：强大的服务网格平台
- **Linkerd**：轻量级服务网格
- **Consul Connect**：HashiCorp的服务网格解决方案

### 开发工具

- **Skaffold**：本地Kubernetes开发
- **Telepresence**：本地开发与远程集群连接
- **Tilt**：本地Kubernetes开发环境

## 实际应用案例

### 微服务应用部署

```yaml
# 前端服务
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: frontend:1.0
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "0.5"
            memory: "512Mi"
          requests:
            cpu: "0.2"
            memory: "256Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: frontend
  ports:
  - port: 80
  type: ClusterIP

# API服务
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: api:1.0
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          value: "database"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: password
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 8080

# 数据库
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database
spec:
  serviceName: "database"
  replicas: 1
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
      - name: database
        image: postgres:13
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: password
        - name: POSTGRES_DB
          value: "myapp"
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: database
spec:
  selector:
    app: database
  ports:
  - port: 5432
```

### 入口配置

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - example.com
    secretName: example-tls
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
```

## 总结

Kubernetes已成为容器编排的事实标准，为现代云原生应用提供了强大的平台。通过自动化部署、扩展和管理容器化应用，Kubernetes解决了传统部署方式的诸多挑战。

掌握Kubernetes不仅需要了解其核心概念和组件，还需要熟悉最佳实践和常见问题的解决方案。随着云原生技术的不断发展，Kubernetes生态系统也在不断壮大，为开发者和运维人员提供了丰富的工具和解决方案。

无论是小型创业公司还是大型企业，Kubernetes都能提供一致的应用部署和管理体验，帮助组织实现DevOps转型，提高开发效率和系统可靠性。 