# @metorial/util-async-iterator

Async iterator utilities for Metorial. Provides programmable async iterators for creating controlled data streams and managing async iteration flow.

## Installation

```bash
npm install @metorial/util-async-iterator
# or
yarn add @metorial/util-async-iterator
# or
pnpm add @metorial/util-async-iterator
# or
bun add @metorial/util-async-iterator
```

## Features

- 🔄 **Programmable Iterators**: Create async iterators with manual control over yielded values
- 📡 **Stream Control**: Control when and what values are yielded
- 🛡️ **Error Handling**: Built-in error handling with throw support
- 🎯 **Flow Management**: Manage iteration flow with yield, throw, and finish methods
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🎯 **Zero Dependencies**: Lightweight with no external dependencies

## Usage

### Basic Programmable Iterator

```typescript
import { createProgrammableAsyncIterator } from '@metorial/util-async-iterator';

// Create a programmable async iterator
let {
  iterator,
  yield: yieldValue,
  finish
} = createProgrammableAsyncIterator<string, string>();

// Use the iterator
async function consumeIterator() {
  for await (let value of iterator) {
    console.log('Received:', value);
  }
}

// Start consuming
let consumer = consumeIterator();

// Yield values programmatically
yieldValue('Hello');
yieldValue('World');
yieldValue('Async');
yieldValue('Iterator');

// Finish the iterator
finish('Done!');

// Output:
// Received: Hello
// Received: World
// Received: Async
// Received: Iterator
// (iterator ends)
```

### Real-time Data Streaming

```typescript
import { createProgrammableAsyncIterator } from '@metorial/util-async-iterator';

class DataStream {
  private { iterator, yield: yieldValue, finish, throw: throwError } = createProgrammableAsyncIterator<DataEvent, void>();

  constructor() {
    this.startStreaming();
  }

  private async startStreaming() {
    // Simulate real-time data
    let interval = setInterval(() => {
      let event: DataEvent = {
        timestamp: Date.now(),
        value: Math.random() * 100,
        type: 'data'
      };

      yieldValue(event);
    }, 1000);

    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(interval);
      finish();
    }, 10000);
  }

  getIterator() {
    return iterator;
  }
}

interface DataEvent {
  timestamp: number;
  value: number;
  type: string;
}

// Usage
let stream = new DataStream();

async function processDataStream() {
  try {
    for await (let event of stream.getIterator()) {
      console.log(`[${new Date(event.timestamp).toISOString()}] Value: ${event.value.toFixed(2)}`);
    }
    console.log('Stream finished');
  } catch (error) {
    console.error('Stream error:', error);
  }
}

processDataStream();
```

### Error Handling

```typescript
import { createProgrammableAsyncIterator } from '@metorial/util-async-iterator';

let {
  iterator,
  yield: yieldValue,
  throw: throwError,
  finish
} = createProgrammableAsyncIterator<number, string>();

async function handleErrors() {
  try {
    for await (let value of iterator) {
      console.log('Value:', value);

      // Simulate an error condition
      if (value > 5) {
        throwError(new Error('Value too high!'));
        break;
      }
    }
  } catch (error) {
    console.error('Caught error:', error.message);
  }
}

// Start the consumer
let consumer = handleErrors();

// Yield some values
yieldValue(1);
yieldValue(3);
yieldValue(7); // This will trigger an error

// Output:
// Value: 1
// Value: 3
// Caught error: Value too high!
```

### Chat-like Message Stream

```typescript
import { createProgrammableAsyncIterator } from '@metorial/util-async-iterator';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

class ChatStream {
  private { iterator, yield: yieldMessage, finish } = createProgrammableAsyncIterator<ChatMessage, void>();

  constructor() {
    this.simulateChat();
  }

  private async simulateChat() {
    let messages = [
      { user: 'Alice', message: 'Hello everyone!' },
      { user: 'Bob', message: 'Hi Alice!' },
      { user: 'Charlie', message: 'How are you all doing?' },
      { user: 'Alice', message: 'Great, thanks!' }
    ];

    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

      yieldMessage({
        id: `msg-${i + 1}`,
        user: messages[i].user,
        message: messages[i].message,
        timestamp: new Date()
      });
    }

    finish();
  }

  getIterator() {
    return iterator;
  }
}

// Usage
let chatStream = new ChatStream();

async function displayChat() {
  console.log('Chat started...\n');

  for await (let message of chatStream.getIterator()) {
    console.log(`[${message.timestamp.toLocaleTimeString()}] ${message.user}: ${message.message}`);
  }

  console.log('\nChat ended.');
}

displayChat();
```

### API Response Streaming

```typescript
import { createProgrammableAsyncIterator } from '@metorial/util-async-iterator';

interface ApiResponse {
  data: any;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

class ApiStream {
  private { iterator, yield: yieldResponse, throw: throwError, finish } = createProgrammableAsyncIterator<ApiResponse, void>();

  async fetchData(url: string) {
    try {
      // Yield loading state
      yieldResponse({ data: null, status: 'loading' });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful response
      let data = { id: 1, name: 'Example Data' };
      yieldResponse({ data, status: 'success' });

      finish();
    } catch (error) {
      yieldResponse({
        data: null,
        status: 'error',
        error: error.message
      });
      throwError(error);
    }
  }

  getIterator() {
    return iterator;
  }
}

// Usage
let apiStream = new ApiStream();

async function handleApiResponse() {
  try {
    for await (let response of apiStream.getIterator()) {
      switch (response.status) {
        case 'loading':
          console.log('Loading...');
          break;
        case 'success':
          console.log('Success:', response.data);
          break;
        case 'error':
          console.error('Error:', response.error);
          break;
      }
    }
  } catch (error) {
    console.error('Stream error:', error);
  }
}

// Start the stream
handleApiResponse();
apiStream.fetchData('https://api.example.com/data');
```

## API Reference

### `createProgrammableAsyncIterator<Y, R>()`

Creates a programmable async iterator with manual control over yielded values.

**Type Parameters:**

- `Y`: Type of yielded values
- `R`: Type of return value

**Returns:** An object with the following properties:

#### `iterator: AsyncIterator<Y, R>`

The async iterator that can be used in `for await...of` loops.

#### `yield(value: Y): void`

Yields a value to the iterator. If the iterator is currently waiting for a value, it will be resolved immediately. Otherwise, the value is queued for the next iteration.

#### `throw(error: Error): void`

Throws an error to the iterator. This will cause the current iteration to fail with the specified error.

#### `finish(value: R): void`

Finishes the iterator with the specified return value. This will end the iteration and resolve any pending promises.

### Behavior

- **Queue Management**: Values are queued when yielded before the iterator is ready to consume them
- **Error Propagation**: Errors thrown via `throw()` are properly propagated to the consumer
- **Completion**: The iterator can only be finished once; subsequent calls to `finish()` are ignored
- **Async Compatibility**: Works seamlessly with `for await...of` loops and other async iteration patterns

## Use Cases

- **Real-time Data Streaming**: Stream live data with manual control
- **API Response Handling**: Handle progressive API responses
- **Event Systems**: Create event streams with programmatic control
- **Testing**: Create controlled async iterators for testing
- **Data Processing**: Process data in chunks with manual flow control

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
