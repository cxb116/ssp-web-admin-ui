<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Page } from '@vben/common-ui';

const route = useRoute();
const logs = ref<string[]>([]);
const connected = ref(false);
const reconnecting = ref(false);
const errorMessage = ref('');
const pending: string[] = [];
const maxLogs = 2000;
let socket: WebSocket | undefined;
let retry = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let disposed = false;

const value = (key: string) => String(route.query[key] ?? '');
const statusText = computed(() => (connected.value ? '已连接' : reconnecting.value ? '重连中' : '未连接'));

function append(valueToAdd: unknown) {
  const text = typeof valueToAdd === 'string' ? valueToAdd : JSON.stringify(valueToAdd);
  pending.push(text === undefined ? String(valueToAdd) : text);
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      logs.value.push(...pending.splice(0));
      if (logs.value.length > maxLogs) logs.value.splice(0, logs.value.length - maxLogs);
      flushTimer = undefined;
    }, 50);
  }
}

function defaultWebsocketUrl() {
  const configuredBase = import.meta.env.VITE_BASE_URL || window.location.origin;
  const apiPath = import.meta.env.VITE_GLOB_API_URL || '/admin-api';
  const base = new URL(configuredBase, window.location.origin);
  const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
  const path = `${base.pathname.replace(/\/$/, '')}/${apiPath.replace(/^\/+|\/+$/g, '')}/ws/`;
  return `${protocol}//${base.host}${path.replace(/\/+/g, '/')}`;
}

async function getUrl() {
  const queryUrl = value('wsUrl');
  if (queryUrl) return queryUrl;
  try {
    const response = await fetch('/config.json', { cache: 'no-store' });
    if (response.ok) {
      const config = await response.json();
      if (typeof config.websocketUrl === 'string' && config.websocketUrl) return config.websocketUrl;
    }
  } catch {
    // Runtime config is optional; fall back to the same-origin endpoint.
  }
  return import.meta.env.VITE_WEBSOCKET_URL || defaultWebsocketUrl();
}

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = undefined;
}

function connect(address: string) {
  if (disposed) return;
  if (!address) {
    errorMessage.value = 'WebSocket 地址为空，请配置 websocketUrl 或传入 wsUrl';
    reconnecting.value = false;
    return;
  }
  errorMessage.value = '';
  try {
    socket = new WebSocket(address);
  } catch (error) {
    errorMessage.value = `WebSocket 地址无效：${String(error)}`;
    return;
  }
  socket.binaryType = 'arraybuffer';
  socket.onopen = () => {
    connected.value = true;
    reconnecting.value = false;
    retry = 0;
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
    }, 30_000);
  };
  socket.onmessage = async (event) => {
    if (typeof event.data === 'string') {
      try { append(JSON.parse(event.data)); } catch { append(event.data); }
    } else if (event.data instanceof ArrayBuffer) append(new TextDecoder().decode(event.data));
    else if (event.data instanceof Blob) append(await event.data.text());
  };
  socket.onerror = () => { errorMessage.value = 'WebSocket 连接失败，请检查地址、服务端和代理配置'; };
  socket.onclose = (event) => {
    connected.value = false;
    stopHeartbeat();
    if (!disposed && event.code !== 1000 && retry < 8) {
      reconnecting.value = true;
      retryTimer = setTimeout(() => connect(address), Math.min(1000 * 2 ** retry++, 30_000));
    } else reconnecting.value = false;
  };
}

onMounted(async () => connect(await getUrl()));
onBeforeUnmount(() => {
  disposed = true;
  if (retryTimer) clearTimeout(retryTimer);
  stopHeartbeat();
  if (flushTimer) clearTimeout(flushTimer);
  pending.length = 0;
  socket?.close(1000, 'page closed');
});
</script>

<template>
  <Page title="日志分析">
    <div class="space-y-4 p-4">
      <a-card title="日志对象" size="small">
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>预算名称：{{ value('budgetName') }}</div>
          <div>预算方广告位 ID：{{ value('dspSlotCode') }}</div>
          <div>广告位名称：{{ value('dspSlotName') }}</div>
          <div>媒体广告位 ID：{{ value('sspSlotId') }}</div>
        </div>
      </a-card>
      <a-card title="实时日志" size="small">
        <template #extra><span>{{ statusText }}</span></template>
        <div v-if="errorMessage" class="mb-2 text-red-500">{{ errorMessage }}</div>
        <pre class="max-h-[60vh] min-h-64 overflow-auto whitespace-pre-wrap bg-gray-950 p-3 text-gray-200">{{ logs.join('\n') }}</pre>
      </a-card>
    </div>
  </Page>
</template>
